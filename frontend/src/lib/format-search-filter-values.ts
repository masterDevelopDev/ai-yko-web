import {
  DocumentFilterValueDto,
  SearchQueryDateFilterValue,
  SearchQueryDateFilterValueTypeEnum,
  SearchQueryDtoFilterValuesInner,
  SearchQueryIntegerFilterValue,
  SearchQueryMultichoiceFilterValue,
  SearchQuerySinglechoiceFilterValue,
  SearchQueryTextFilterValue,
  SearchQueryYearFilterValue,
} from './axios-client'

/**
 * @todo handle the case of integer values
 */

export const formatSearchFilterValueForDocumentCreation = (
  sfv: SearchQueryDtoFilterValuesInner,
): DocumentFilterValueDto => {
  switch (sfv.type) {
    case SearchQueryDateFilterValueTypeEnum.Date:
      const sfvd = sfv as SearchQueryDateFilterValue
      return {
        type: sfvd.type,
        filterId: sfvd.filterId,
        value: {
          date: sfvd.firstDate,
        },
      }

    case SearchQueryDateFilterValueTypeEnum.Year:
      const sfvy = sfv as SearchQueryYearFilterValue
      return {
        type: sfvy.type,
        filterId: sfvy.filterId,
        value: {
          year: sfvy.firstYear,
        },
      }

    case SearchQueryDateFilterValueTypeEnum.Text:
      const sfvt = sfv as SearchQueryTextFilterValue
      return {
        type: sfvt.type,
        filterId: sfvt.filterId,
        value: {
          text: sfvt.text!,
        },
      }

    case SearchQueryDateFilterValueTypeEnum.MultiChoice:
      const sfvmc = sfv as SearchQueryMultichoiceFilterValue
      return {
        type: sfvmc.type,
        filterId: sfvmc.filterId,
        value: {
          choiceIds: sfvmc.choiceIds,
        },
      }

    case SearchQueryDateFilterValueTypeEnum.Integer:
      const sfvi = sfv as SearchQueryIntegerFilterValue
      return {
        type: sfvi.type,
        filterId: sfvi.filterId,
        value: {
          integer: sfvi.firstInteger,
        },
      }

    case SearchQueryDateFilterValueTypeEnum.SingleChoice:
      const sfvsc = sfv as SearchQuerySinglechoiceFilterValue
      return {
        type: sfvsc.type,
        filterId: sfvsc.filterId,
        value: {
          choiceId: sfvsc.choiceId,
        },
      }

    default:
      throw new Error(
        'Filter type not recognized: ' + JSON.stringify(sfv, null, 2),
      )
  }
}
