import { PrismaClient } from '@prisma/client';
import BOTTLES_METADATA from './data-initial-migration/ListData_Bottles.json';
import WRITING_INSTRUMENT_METADATA from './data-initial-migration/ListData_WritingInstrument.json';
import assert from 'node:assert';

const prismaClient = new PrismaClient();

assert(Array.isArray(BOTTLES_METADATA));
assert(Array.isArray(WRITING_INSTRUMENT_METADATA));

const addAllMetadata = async () => {
  const results =
    (await prismaClient.$queryRaw`SELECT filename FROM "Document"`) as any[];
  const filenames = results.map(({ filename }) => filename);

  const addMetadata = async (array: any[]) => {
    const metadataAndFileNames = array.filter(
      (metadata) =>
        filenames.includes(metadata.FileLeafRef) &&
        Number.isInteger(
          Number.parseInt(metadata.AnneePublication.replace(',', '')),
        ),
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const metadata of metadataAndFileNames) {
      /*
     
      const result = await prismaClient.document.updateMany({
       
        where: {
          filename: String(metadata.FileLeafRef),

          // TODO use filter id
          // year: String(metadata.AnneePublication.replace(',', '')),
        },
      });
     */
      // console.log({ result });
    }
  };

  await addMetadata(BOTTLES_METADATA as any[]);
  await addMetadata(WRITING_INSTRUMENT_METADATA as any[]);
};

addAllMetadata();
