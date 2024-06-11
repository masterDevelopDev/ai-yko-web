import { Client } from '@elastic/elasticsearch';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SearchQueryDateFilterValue,
  SearchQueryDto,
  SearchQueryFilterValueDto,
  SearchQueryYearFilterValue,
} from '../search/dto/search-query.dto';
import {
  AggregationsAggregate,
  MappingProperty,
  QueryDslQueryContainer,
  SearchHit,
  SearchResponse,
  SearchTotalHits,
} from '@elastic/elasticsearch/lib/api/types';
import {
  DateFilterSearchMode,
  DocumentStatus,
  FilterKind,
  FilterType,
  FilterValue,
  TextFilterSearchMode,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { Prisma } from '@prisma/client';
import {
  SageMakerRuntimeClient,
  InvokeEndpointCommand,
} from '@aws-sdk/client-sagemaker-runtime';
import { InjectAws } from 'aws-sdk-v3-nest';
import {
  ELASTICSEARCH_CLIENT_KEY,
  ES_INDEX_NUMBER_OF_REPLICAS,
  ES_INDEX_NUMBER_OF_SHARDS,
  IMAGE_VECTORS_DIMENSIONS,
} from './search-engine.constants';
import { File } from '@nest-lab/fastify-multer';
import { decodeAwsResponseBody } from '../common/aws.utils';
import { RefinementFilterDto } from '../search/dto/search-result.dto';

export type DocumentWithCategoryAndFilterValuesAndChoices =
  Prisma.DocumentGetPayload<{
    include: { category: true; filterValues: true; images: true };
  }>;

type CategoryWithFilters = Prisma.CategoryGetPayload<{
  include: {
    filterOrFilterGroups: {
      where: {
        kind: 'FILTER';
      };
    };
  };
}>;

type DocumentWithScore = DocumentWithCategoryAndFilterValuesAndChoices & {
  score?: number;
};

@Injectable()
export class SearchEngineService implements OnModuleInit {
  private logger = new Logger(SearchEngineService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    @InjectAws(SageMakerRuntimeClient)
    private readonly sagemakerClient: SageMakerRuntimeClient,
    @Inject(ELASTICSEARCH_CLIENT_KEY) private readonly client: Client,
  ) {}

  private ALL_FILTER_IDS: { name: string; id: string; type: FilterType }[] = [];

  private FILTER_ID_TO_NAME_MAPPING: Record<string, string> = {};

  async onModuleInit() {
    const categories = await this.prismaService.category.findMany({
      include: {
        filterOrFilterGroups: {
          where: {
            kind: FilterKind.FILTER,
            type: {
              notIn: [FilterType.TEXT],
            },
          },
        },
      },
    });

    categories.map((category) => {
      this.synchronizeIndexMappingWithCategory(this.client, category);
    });

    const allFilters = await this.prismaService.filterOrFilterGroup.findMany({
      where: {
        kind: FilterKind.FILTER,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    this.ALL_FILTER_IDS = allFilters;

    allFilters.forEach(({ id, name }) => {
      this.FILTER_ID_TO_NAME_MAPPING[id] = name;
    });
  }

  getFilterName(filterId: string) {
    const name = this.FILTER_ID_TO_NAME_MAPPING[filterId];

    return name;
  }

  getIndexName({ categoryId }: { categoryId: string }) {
    return `${categoryId === 'generic' ? '*' : categoryId}_index`;
  }

  getFiltersWithNoCategory() {
    return this.prismaService.filterOrFilterGroup.findMany({
      where: {
        categoryId: null,
        kind: FilterKind.FILTER,
      },
    });
  }

  async synchronizeIndexMappingWithCategory(
    c: Client,
    category: CategoryWithFilters,
  ) {
    try {
      const DELETE_INDEXES_AND_RECREATE_THEM_WARNING_DANGEROUS = false;

      if (DELETE_INDEXES_AND_RECREATE_THEM_WARNING_DANGEROUS) {
        try {
          const indexName = this.getIndexName({
            categoryId: category.id,
          });

          const exists = await c.indices.exists({
            index: indexName,
          });

          if (exists) {
            await c.indices.delete({
              index: indexName,
            });

            this.logger.warn('DELETED INDEX ' + indexName);
          }

          const mappingsProperties: Record<string, MappingProperty> = {};

          const filtersWithNoCategory = await this.getFiltersWithNoCategory();

          [...filtersWithNoCategory, ...category.filterOrFilterGroups].map(
            (filter) => {
              const mapping: MappingProperty = { type: undefined };

              switch (filter.type) {
                case FilterType.DATE:
                  /** @todo add format: 'yyyy-MM-dd' */
                  mapping.type = 'date';
                  break;
                case FilterType.YEAR:
                  mapping.type = 'integer';
                  break;
                case FilterType.INTEGER:
                  mapping.type = 'integer';
                  break;
                case FilterType.TEXT:
                  mapping.type = 'keyword';
                  break;
                case FilterType.MULTI_CHOICE:
                  mapping.type = 'keyword';
                  break;
                case FilterType.SINGLE_CHOICE:
                  mapping.type = 'keyword';
                  break;

                default:
                  break;
              }

              mappingsProperties[filter.id] = mapping;
            },
          );

          mappingsProperties['description'] = { type: 'text' };

          mappingsProperties['filename'] = { type: 'keyword' };

          mappingsProperties['embeddings'] = {
            type: 'nested',
            properties: {
              embedding: {
                type: 'dense_vector',
                dims: IMAGE_VECTORS_DIMENSIONS,
                index: true,
                similarity: 'cosine',
              },
              importance: {
                type: 'integer',
              },
              key: {
                type: 'text',
                index: false,
              },
            },
          };

          const { index } = await c.indices.create({
            settings: {
              number_of_shards: ES_INDEX_NUMBER_OF_SHARDS,
              number_of_replicas: ES_INDEX_NUMBER_OF_REPLICAS,
            },

            index: indexName,

            body: {
              mappings: {
                properties: mappingsProperties,
              },
            },
          });

          this.logger.log('INDEX CREATED UNDER THE NAME: ' + index);
        } catch (error) {
          this.logger.error(error);
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  getFileUrl(filename: string) {
    return `https://${this.configService.get(
      'AWS_PDF_DOCUMENTS_BUCKET',
    )}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${filename}`;
  }

  getImageUrl(key: string) {
    return `https://${this.configService.get(
      'AWS_EXTRACTED_IMAGES_BUCKET',
    )}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
  }

  formatDocumentFilterValuesForIndexation(
    document: DocumentWithCategoryAndFilterValuesAndChoices,
  ) {
    const filterValues: FilterValue[] = [
      ...document.filterValues,
      {
        type: FilterType.DATE,
        stringValue: document.createdAt.toISOString(),
        filterId: 'creation-date',

        /** These values are here to make typescript happy and won't be used ☺ */
        id: Date.now(),
        integerValue: null,
        secondIntegerValue: null,
        secondStringValue: null,
        documentId: document.id,
        textMode: null,
        dateMode: null,
        negate: null,
        choiceIds: [],
        searchQueryId: Date.now(),
      },
    ];

    return Object.fromEntries(
      filterValues.map((fv) => {
        let esValue: number | string | string[];

        switch (fv.type) {
          case FilterType.INTEGER:
            esValue = fv.integerValue;
            break;

          case FilterType.YEAR:
            esValue = fv.integerValue;
            break;

          case FilterType.DATE:
            esValue = fv.stringValue;
            break;

          case FilterType.MULTI_CHOICE:
            esValue = fv.choiceIds;
            break;

          case FilterType.SINGLE_CHOICE:
            esValue = fv.choiceIds;
            break;

          case FilterType.TEXT:
            esValue = fv.stringValue;
            break;

          default:
            throw 'Filter type not recognized: ' + fv.type;
        }

        return [fv.filterId, esValue];
      }),
    );
  }

  getFullTextToIndex(
    document: DocumentWithCategoryAndFilterValuesAndChoices,
    extractedTextFromPdf: string,
  ) {
    let finalText = extractedTextFromPdf;

    document.filterValues.forEach((fv) => {
      switch (fv.type) {
        case FilterType.MULTI_CHOICE:
        case FilterType.SINGLE_CHOICE:
          /** @todo this method returns undefined here */
          const filtername = this.getFilterName(fv.filterId);

          const value = fv.choiceIds.join(' ');

          finalText += ` ${filtername} ${value}`;
          break;

        default:
          break;
      }
    });

    return finalText;
  }

  async indexDocument(
    document: DocumentWithCategoryAndFilterValuesAndChoices,
    file?: File,
    base64File?: string,
  ) {
    try {
      if (file || base64File) {
        this.logger.warn('BEGINNING EXTRACTION FOR ' + document.filename);

        console.time(document.filename);

        const { fullText, images } = await this.extractPdfData(
          document.filename,
          file,
          base64File,
        );

        console.timeEnd(document.filename);

        this.logger.warn(
          'END EXTRACTION ' + document.filename + ` : ${images.length} IMAGES`,
        );

        const updatedDocument = await this.prismaService.document.update({
          where: { id: document.id },
          include: {
            images: true,
            filterValues: true,
            category: true,
          },
          data: {
            images: {
              deleteMany: {
                documentId: document.id,
              },
              createMany: {
                data: images.map(({ key }) => ({ url: this.getImageUrl(key) })),
              },
            },
          },
        });

        const docToIndex = {
          ...this.formatDocumentFilterValuesForIndexation(document),
          description: this.getFullTextToIndex(document, fullText),
          filename: document.filename,
          fileUrl: this.getFileUrl(document.filename),
          document: updatedDocument,
          embeddings: images.map(({ embedding, key }) => ({
            embedding,
            key,
            importance: 1,
          })),
        };

        await this.client.index({
          index: this.getIndexName({
            categoryId: document.categoryId,
          }),
          id: document.id,
          document: docToIndex,
        });

        await this.prismaService.document.update({
          where: { id: document.id },
          data: {
            status: DocumentStatus.INDEXED,
          },
        });
      }
    } catch (error) {
      this.logger.error(
        'Could not index document ' + document.id + ' ' + document.filename,
        error,
      );

      await this.prismaService.document.update({
        where: { id: document.id },
        data: {
          status: DocumentStatus.ERROR,
        },
      });
    }
  }

  async updateDocumentFilters(
    document: DocumentWithCategoryAndFilterValuesAndChoices,
  ) {
    const docInES = await this.client.get({
      index: this.getIndexName({ categoryId: document.categoryId }),
      id: document.id,
    });

    const source = docInES._source as any;

    const { embeddings, description, filename, fileUrl } = source;

    const newDoc = {
      ...this.formatDocumentFilterValuesForIndexation(document),
      embeddings,
      description,
      filename,
      fileUrl,
      document,
    };

    await this.client.index({
      index: this.getIndexName({ categoryId: document.categoryId }),
      id: document.id,
      document: newDoc,
      refresh: true,
    });
  }

  async deleteDocument(documentId: string, categoryId: string) {
    await this.client.delete({
      id: documentId,
      index: this.getIndexName({ categoryId }),
      refresh: true,
    });
  }

  formatFilterValueFromDbToSearchQueryFilterValueDto(
    filterValue: FilterValue,
  ): SearchQueryFilterValueDto {
    switch (filterValue.type) {
      case FilterType.DATE:
        return {
          type: FilterType.DATE,
          filterId: filterValue.filterId,
          firstDate: filterValue.stringValue,
          secondDate: filterValue.secondStringValue,
          mode: filterValue.dateMode,
        };

      case FilterType.YEAR:
        return {
          type: FilterType.YEAR,
          filterId: filterValue.filterId,
          firstYear: filterValue.integerValue,
          secondYear: filterValue.secondIntegerValue,
          mode: filterValue.dateMode,
        };

      case FilterType.TEXT:
        return {
          type: FilterType.TEXT,
          filterId: filterValue.filterId,
          text: filterValue.stringValue,
          mode: filterValue.textMode,
          negate: filterValue.negate,
        };

      case FilterType.INTEGER:
        return {
          type: FilterType.INTEGER,
          filterId: filterValue.filterId,
          firstInteger: filterValue.integerValue,
          secondInteger: filterValue.secondIntegerValue,
          mode: filterValue.dateMode,
        };

      case FilterType.MULTI_CHOICE:
      case FilterType.SINGLE_CHOICE:
        return {
          type: FilterType.MULTI_CHOICE,
          filterId: filterValue.filterId,
          choiceIds: filterValue.choiceIds,
        };

      default:
        throw new Error(
          'Filter type not recognized for fitler value: ' + filterValue.type,
        );
    }
  }

  async deactivateImagesOfDocumentsThatMatchOneEmbedding(embedding: number[]) {
    const MIN_SCORE_FOR_WHICH_TO_DEACTIVATE = 0.95;

    const query: QueryDslQueryContainer = {
      bool: {
        must: [
          {
            nested: {
              inner_hits: { size: 100 },
              path: 'embeddings',
              score_mode: 'max',
              query: {
                bool: {
                  must: {
                    script_score: {
                      query: {
                        match_all: {},
                      },
                      script: {
                        source:
                          "cosineSimilarity(params.embedding, 'embeddings.embedding')",
                        params: { embedding },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    };

    /** @todo use pagination API */
    const search = async (off: number) => {
      return await this.client.search({
        index: this.getIndexName({ categoryId: '*' }),

        query,

        min_score: MIN_SCORE_FOR_WHICH_TO_DEACTIVATE,

        from: off,

        size: 9999,
      });
    };

    const searchResults = await search(0);

    for (const result of searchResults.hits.hits) {
      const keysToDeactivate = result.inner_hits.embeddings.hits.hits
        .filter(({ _score }) => _score > MIN_SCORE_FOR_WHICH_TO_DEACTIVATE)
        .map(({ _source }) => _source.key as string);

      await this.client.update({
        id: result._id,
        index: result._index,
        refresh: true,
        script: {
          source: `
              ctx._source.embeddings.stream()
              .filter(embWithKey -> params.keys_to_deactivate.contains(embWithKey.key))
              .forEach(embWithKey -> embWithKey.importance = 0)
            `,
          params: {
            keys_to_deactivate: keysToDeactivate,
          },
        },
      });
    }
  }

  async deactivateImagesOfDocumentsThatMatchEmbeddings(imageFiles: File[]) {
    const RESET_ALL_IMPORTANCES = false;

    if (RESET_ALL_IMPORTANCES) {
      await this.client.updateByQuery({
        index: '*index',
        refresh: true,
        query: {
          match_all: {},
        },
        script: {
          source: `
        if (ctx._source != null && ctx._source.embeddings != null){
          ctx["_source"].embeddings.stream().forEach(embWithKey -> embWithKey.importance = 1);
        }
          `,
        },
      });

      return;
    }

    const { Embeddings } = await this.getImageEmbeddings(imageFiles);

    await Promise.all(
      Embeddings.map((e) =>
        this.deactivateImagesOfDocumentsThatMatchOneEmbedding(e),
      ),
    );
  }

  formatText(s: string) {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  buildESQuery(searchQueryDto: SearchQueryDto, embeddings: number[][]) {
    const query: QueryDslQueryContainer = {};

    const mustClauses = [];

    const hasText = !!searchQueryDto.text?.trim();

    if (embeddings.length > 0) {
      mustClauses.push({
        nested: {
          path: 'embeddings',
          score_mode: 'max',
          query: {
            bool: {
              should: embeddings.map((embedding) => ({
                script_score: {
                  query: {
                    bool: {
                      must: [{ term: { 'embeddings.importance': 1 } }],
                    },
                  },
                  script: {
                    source:
                      "cosineSimilarity(params.embedding, 'embeddings.embedding')",
                    params: { embedding },
                  },
                },
              })),
            },
          },
        },
      });
    }

    if (hasText) {
      const text = this.formatText(searchQueryDto.text);

      const isSearchByFilename = searchQueryDto.text?.endsWith('.pdf');

      mustClauses.push({
        bool: {
          minimum_should_match: 1,
          should: isSearchByFilename
            ? [
                {
                  term: {
                    filename: {
                      value: text,
                    },
                  },
                },
              ]
            : [
                {
                  match: {
                    description: text,
                  },
                },

                {
                  match: {
                    description: {
                      query: text,
                      fuzziness: 2,
                    },
                  },
                },
                {
                  more_like_this: {
                    fields: ['description'],
                    like: text,
                    min_term_freq: 1,
                    max_query_terms: 12,
                  },
                },
              ],
        },
      });
    }

    if (searchQueryDto.filterValues && searchQueryDto.filterValues.length > 0) {
      for (const fv of searchQueryDto.filterValues) {
        switch (fv.type) {
          case FilterType.DATE:
            const rangeClause = {};

            const dfv = fv as SearchQueryDateFilterValue;

            if (dfv.secondDate) {
              rangeClause[dfv.filterId] = {
                gte: dfv.firstDate,
                lte: dfv.secondDate,
              };
            } else {
              if (dfv.mode === DateFilterSearchMode.BEFORE) {
                rangeClause[dfv.filterId] = {
                  lt: dfv.firstDate,
                };
              } else if (dfv.mode === DateFilterSearchMode.EQUAL) {
                mustClauses.push({
                  match: { [dfv.filterId]: dfv.firstDate },
                });
              } else if (dfv.mode === DateFilterSearchMode.AFTER) {
                rangeClause[dfv.filterId] = {
                  gt: dfv.firstDate,
                };
              } else if (dfv.mode === DateFilterSearchMode.BEFORE_OR_EQUAL) {
                rangeClause[dfv.filterId] = {
                  lte: dfv.firstDate,
                };
              } else if (dfv.mode === DateFilterSearchMode.AFTER_OR_EQUAL) {
                rangeClause[dfv.filterId] = {
                  gte: dfv.firstDate,
                };
              }
            }

            if (Object.keys(rangeClause).length > 0) {
              mustClauses.push({ range: rangeClause });
            }

            break;

          case FilterType.YEAR:
            const rangeClauseYear = {};

            const v = fv as SearchQueryYearFilterValue;

            if (v.secondYear) {
              rangeClauseYear[v.filterId] = {
                gte: v.firstYear,
                lte: v.secondYear,
              };
            } else {
              if (v.mode === DateFilterSearchMode.EQUAL) {
                mustClauses.push({
                  match: { [v.filterId]: v.firstYear },
                });
              } else {
                if (v.mode === DateFilterSearchMode.BEFORE) {
                  rangeClauseYear[v.filterId] = {
                    lt: v.firstYear,
                  };
                } else if (v.mode === DateFilterSearchMode.AFTER) {
                  rangeClauseYear[v.filterId] = {
                    gt: v.firstYear,
                  };
                } else if (v.mode === DateFilterSearchMode.BEFORE_OR_EQUAL) {
                  rangeClauseYear[v.filterId] = {
                    lte: v.firstYear,
                  };
                } else if (v.mode === DateFilterSearchMode.AFTER_OR_EQUAL) {
                  rangeClauseYear[v.filterId] = {
                    gte: v.firstYear,
                  };
                }
              }
            }

            if (Object.keys(rangeClauseYear).length > 0) {
              mustClauses.push({ range: rangeClauseYear });
            }

            break;

          case FilterType.SINGLE_CHOICE:
            const mustClauseSinglechoice = {
              match: {},
            };

            mustClauseSinglechoice.match[fv.filterId] = fv.choiceId;
            mustClauses.push(mustClauseSinglechoice);

            break;

          case FilterType.INTEGER:
            const mustClauseInteger = {
              term: {},
            };

            mustClauseInteger.term[fv.filterId] = fv.firstInteger;
            mustClauses.push(mustClauseInteger);

            break;

          case FilterType.MULTI_CHOICE:
            const mustClauseMultichoice = {
              terms: {},
            };

            mustClauseMultichoice.terms[fv.filterId] = fv.choiceIds;

            mustClauses.push(mustClauseMultichoice);

            break;

          case FilterType.TEXT:
            const mustClauseText = {
              terms: {},
            };

            switch (fv.mode) {
              case TextFilterSearchMode.EQUAL:
                if (fv.negate) {
                  mustClauseText.terms[fv.filterId] = fv.text;
                } else {
                  mustClauseText.terms[fv.filterId] = fv.text;
                }
                break;

              case TextFilterSearchMode.CONTAINS:
                if (fv.negate) {
                  mustClauseText.terms[fv.filterId] = fv.text;
                } else {
                  mustClauseText.terms[fv.filterId] = fv.text;
                }
                break;

              case TextFilterSearchMode.ISIN:
                if (fv.negate) {
                  mustClauseText.terms[fv.filterId] = fv.text;
                } else {
                  mustClauseText.terms[fv.filterId] = fv.text;
                }
                break;

              case TextFilterSearchMode.STARTSWITH:
                if (fv.negate) {
                  mustClauseText.terms[fv.filterId] = fv.text;
                } else {
                  mustClauseText.terms[fv.filterId] = fv.text;
                }
                break;

              case TextFilterSearchMode.ENDSWITH:
                if (fv.negate) {
                  mustClauseText.terms[fv.filterId] = fv.text;
                } else {
                  mustClauseText.terms[fv.filterId] = fv.text;
                }
                break;

              case TextFilterSearchMode.ISNULL:
                if (fv.negate) {
                  mustClauseText.terms[fv.filterId] = fv.text;
                } else {
                  mustClauseText.terms[fv.filterId] = fv.text;
                }
                break;

              default:
                break;
            }

            mustClauses.push(mustClauseText);

            break;

          default:
            break;
        }
      }
    }

    query.bool = {
      must: mustClauses,
    };

    return query;
  }

  convertFileToBase64String(file: File): string {
    return file.buffer.toString('base64');
  }

  async extractPdfData(
    key: string,
    file: File,
    base64File?: string,
  ): Promise<{
    fullText: string;
    images: Array<{ key: string; embedding: number[] }>;
  }> {
    const extractImagesAndTextCommand = new InvokeEndpointCommand({
      EndpointName: this.configService.get(
        'AWS_EXTRACTION_MODEL_SAGEMAKER_ENDPOINT_NAME',
      ),
      Body: JSON.stringify({
        Base64File: base64File ?? this.convertFileToBase64String(file),
        Key: key,
        InputBucket: this.configService.get('AWS_PDF_DOCUMENTS_BUCKET'),
        OutputImageBucket: this.configService.get(
          'AWS_EXTRACTED_IMAGES_BUCKET',
        ),
      }),
    });

    const response = await this.sagemakerClient.send(
      extractImagesAndTextCommand,
    );

    const { full_text: fullText, images } = decodeAwsResponseBody(
      response.Body,
    );

    return { fullText, images };
  }

  async getImageEmbeddings(
    imageFiles: File[],
  ): Promise<{ Embeddings: Array<number[]> }> {
    const vectorizeImagesCommand = new InvokeEndpointCommand({
      EndpointName: this.configService.get(
        'AWS_VECTORIZATION_MODEL_SAGEMAKER_ENDPOINT_NAME',
      ),
      Body: JSON.stringify({
        Base64Files: imageFiles.map(this.convertFileToBase64String),
      }),
    });

    const vectorizeImagesResponse = await this.sagemakerClient.send(
      vectorizeImagesCommand,
    );

    const imageEmbeddings = decodeAwsResponseBody(vectorizeImagesResponse.Body);

    return imageEmbeddings;
  }

  async searchByIds(ids: string[]) {
    const documents = await this.searchFullTextAndFiltersAndImages({}, [], ids);

    return documents;
  }

  async search(
    searchQueryDto: SearchQueryDto,
    imageFiles: File[],
    embeddings?: number[][],
  ): Promise<{
    results: DocumentWithScore[];
    total: number;
    moreThan: boolean;
    refinementFilters: RefinementFilterDto[];
  }> {
    let results: DocumentWithScore[] = [];
    let numberTotal = 0;
    let moreThan = false;

    let refinementFilters: RefinementFilterDto[] = [];

    const embeddingsToUse = embeddings ?? [];

    if (imageFiles.length > 0) {
      const { Embeddings } = await this.getImageEmbeddings(imageFiles);

      embeddingsToUse.push(...Embeddings);
    }

    const {
      total: textTotal,
      results: textResults,
      refinementFilters: refinementFiltersText,
    } = await this.searchFullTextAndFiltersAndImages(
      searchQueryDto,
      embeddingsToUse,
    );

    refinementFilters = refinementFiltersText;

    if (typeof textTotal === 'number') {
      numberTotal += textTotal;
    } else {
      numberTotal = textTotal.value;

      if (textTotal.relation === 'gte') {
        moreThan = true;
      }
    }

    results = results.concat(textResults);

    return {
      results,
      total: numberTotal,
      moreThan,
      refinementFilters,
    };
  }

  formatElasticSearchTextHits(
    hits: SearchHit[],
    maxScore: number,
  ): DocumentWithScore[] {
    const searchResults = hits.map((r) => {
      const source = r._source as any;

      const document = source.document as DocumentWithScore;

      document.score = r._score / maxScore;

      const imageKeysToInclude = source.embeddings
        .filter(({ importance }) => importance === 1)
        .map(({ key }) => key);

      document.images = document.images.filter(({ url }) =>
        imageKeysToInclude.includes(url.split('/').at(-1)),
      );

      return document;
    });

    return searchResults;
  }

  getAggsQuery() {
    return {
      ...Object.fromEntries(
        this.ALL_FILTER_IDS.map(({ id: filterId, type }) => [
          filterId,
          {
            terms: {
              field: `${filterId}${type === FilterType.TEXT ? '.keyword' : ''}`,
              size: 10,
            },
          },
        ]),
      ),
    };
  }

  getRefinementFiltersFromAggregations(
    result: SearchResponse<unknown, Record<string, AggregationsAggregate>>,
  ) {
    const refinementFilters: RefinementFilterDto[] = [];

    Object.entries(result.aggregations).forEach(([key, value]) => {
      if (
        // @ts-expect-error the exact type of `value` is not guaranteed
        value.buckets.length <= 1 ||
        key === 'filename' ||
        key === 'creation-date'
      )
        return;

      refinementFilters.push({
        // @ts-expect-error the exact type of `value` is not guaranteed
        counts: value.buckets.map(({ key, doc_count }) => ({
          value: key,
          count: doc_count,
        })),
        filter: {
          name: this.getFilterName(key),
          kind: FilterKind.FILTER,
          type: FilterType.MULTI_CHOICE,
          id: key,
          // @ts-expect-error the exact type of `value` is not guaranteed
          options: value.buckets.map(({ key }) => key),
        },
      });
    });

    return refinementFilters;
  }

  async searchFullTextAndFiltersAndImages(
    searchQueryDto: SearchQueryDto,
    embeddings?: number[][],
    ids?: string[],
  ): Promise<{
    total: number | SearchTotalHits;
    results: DocumentWithCategoryAndFilterValuesAndChoices[];
    refinementFilters: RefinementFilterDto[];
  }> {
    const { categoryId, offset, limit } = searchQueryDto;

    let result: SearchResponse<unknown, Record<string, AggregationsAggregate>>;

    if (ids) {
      result = await this.client.search({
        index: this.getIndexName({ categoryId: '*' }),

        size: 100,

        query: {
          ids: {
            values: ids,
          },
        },
      });
    } else {
      result = await this.client.search({
        index: this.getIndexName({ categoryId }),

        query: this.buildESQuery(searchQueryDto, embeddings),

        aggs: this.getAggsQuery(),

        size: limit,

        from: offset,
      });
    }

    return {
      total: result.hits.total,
      results: this.formatElasticSearchTextHits(
        result.hits.hits,
        result.max_score ?? 1,
      ),
      refinementFilters: ids
        ? []
        : this.getRefinementFiltersFromAggregations(result),
    };
  }
}
