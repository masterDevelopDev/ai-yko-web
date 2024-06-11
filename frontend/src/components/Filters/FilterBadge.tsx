'use client'

import {
  FilterDtoTypeEnum,
  SearchQueryDateFilterValue,
  SearchQueryDateFilterValueModeEnum,
  SearchQueryDtoFilterValuesInner,
  SearchQueryIntegerFilterValue,
  SearchQueryMultichoiceFilterValue,
  SearchQuerySinglechoiceFilterValue,
  SearchQueryTextFilterValue,
  SearchQueryTextFilterValueModeEnum,
  SearchQueryYearFilterValue,
} from '@/lib/axios-client'
import { MODE_TO_SYMBOL } from './filters/utils'
import { classnames } from '@/styles/classnames'

type Props = {
  filterValue: SearchQueryDtoFilterValuesInner
  filterName: string
  removeFilterValue?: () => void
  onClick?: () => void
  className?: string
}

const getFilterValueAsString = (
  value: SearchQueryDtoFilterValuesInner,
  filtername: string,
) => {
  try {
    switch (value.type) {
      case FilterDtoTypeEnum.Year:
        const v = value as SearchQueryYearFilterValue
        // @ts-ignore
        const symbol = MODE_TO_SYMBOL[v.mode]
        return (
          filtername +
          (v.mode && v.mode !== SearchQueryDateFilterValueModeEnum.Equal
            ? symbol
            : ': ') +
          v.firstYear +
          (v.secondYear ? '⇒' + v.secondYear : '')
        )

      case FilterDtoTypeEnum.Date:
        const u = value as SearchQueryDateFilterValue
        // @ts-ignore
        const symbolDate = MODE_TO_SYMBOL[u.mode]
        return (
          filtername +
          (u.mode ? symbolDate : ': ') +
          u.firstDate +
          (u.secondDate ? '⇒' + u.secondDate : '')
        )

      case FilterDtoTypeEnum.Text:
        const w = value as SearchQueryTextFilterValue
        return `${filtername}: ${w.negate ? 'not' : ''} ${w.mode.toLowerCase()}${
          w.mode === SearchQueryTextFilterValueModeEnum.Isnull
            ? ''
            : ': ' + w.text
        }`

      case FilterDtoTypeEnum.SingleChoice:
        const x = value as SearchQuerySinglechoiceFilterValue
        return filtername + ': ' + x.choiceId

      case FilterDtoTypeEnum.MultiChoice:
        const mc = value as SearchQueryMultichoiceFilterValue
        return filtername + ': ' + mc.choiceIds.join(',')

      case FilterDtoTypeEnum.Integer:
        const n = value as SearchQueryIntegerFilterValue

        return filtername + ': ' + n.firstInteger?.toString()

      default:
        return filtername + ': filter type not recognized'
    }
  } catch {
    // @ts-ignore
    return filtername + ': ' + value.text
  }
}

const FilterBadge = ({
  filterValue,
  filterName,
  removeFilterValue,
  onClick,
  className,
}: Props) => {
  return (
    <span
      onClick={onClick}
      className={classnames(
        'inline-flex cursor-pointer items-center gap-x-[1px] rounded-md bg-gray-50 px-1 py-0.5 text-xs font-thin text-gray-700 ring-1 ring-inset ring-gray-600/20 sm:gap-x-0.5 sm:px-2 sm:py-1 sm:text-sm sm:font-medium',
        className,
      )}
    >
      <p>{getFilterValueAsString(filterValue, filterName)}</p>

      {removeFilterValue ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            removeFilterValue()
          }}
          className="group relative h-2 w-2 rounded-sm hover:bg-gray-500/20 sm:-mr-1 sm:h-3.5 sm:w-3.5"
        >
          <svg
            viewBox="0 0 14 14"
            className="h-2.5 w-2.5 stroke-gray-600/50 group-hover:stroke-gray-600/75 sm:h-3.5 sm:w-3.5"
          >
            <path d="M4 4l6 6m0-6l-6 6" />
          </svg>
          <span className="absolute -inset-1" />
        </button>
      ) : null}
    </span>
  )
}

export default FilterBadge
