'use client'

import {
  SearchQueryIntegerFilterValue,
  SearchQueryIntegerFilterValueModeEnum,
  SearchQueryIntegerFilterValueTypeEnum,
} from '@/lib/axios-client'
import { useEffect, useId, useState } from 'react'
import { FilterAndFilterValuesAndFunctions } from '../getFilterOrFilterGroupComponent'

const IntegerFilter = ({
  selectedFilterOrGroup: selectedFilter,
  addOrUpdateFilterValue,
  selectedFilterValues,
}: FilterAndFilterValuesAndFunctions) => {
  const integerCurrentFilterValue = selectedFilterValues.find(
    ({ filterId }) => selectedFilter.id === filterId,
  ) as SearchQueryIntegerFilterValue | undefined

  const [value, setValue] = useState(
    integerCurrentFilterValue ??
      ({
        type: SearchQueryIntegerFilterValueTypeEnum.Integer,
        mode: SearchQueryIntegerFilterValueModeEnum.Equal,
        firstInteger: 1,
        negate: false,
        filterId: selectedFilter.id,
      } as SearchQueryIntegerFilterValue),
  )

  const textComponentId = useId()

  useEffect(() => {
    addOrUpdateFilterValue({
      type: SearchQueryIntegerFilterValueTypeEnum.Integer,
      mode: value.mode,
      firstInteger: value.firstInteger,
      filterId: selectedFilter.id,
    } as SearchQueryIntegerFilterValue)
  }, [value])

  return (
    <div className="flex w-full flex-row flex-wrap items-center gap-1">
      <p>{selectedFilter.name} equals</p>

      <input
        type="number"
        value={value.firstInteger}
        name={textComponentId}
        id={textComponentId}
        className="block min-w-[50px] flex-grow rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        placeholder="enter text to match"
        onChange={(event) =>
          setValue({ ...value, firstInteger: Number(event.target.value) })
        }
      />
    </div>
  )
}

export default IntegerFilter
