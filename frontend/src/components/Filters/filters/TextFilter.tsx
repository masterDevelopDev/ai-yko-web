'use client'

import {
  SearchQueryTextFilterValue,
  SearchQueryTextFilterValueModeEnum,
  SearchQueryTextFilterValueTypeEnum,
} from '@/lib/axios-client'
import { useEffect, useId, useState } from 'react'
import { FilterAndFilterValuesAndFunctions } from '../getFilterOrFilterGroupComponent'

const TextFilter = ({
  selectedFilterOrGroup: selectedFilter,
  addOrUpdateFilterValue,
  selectedFilterValues,
  removeFilterValue,
  isSearchMode,
}: FilterAndFilterValuesAndFunctions) => {
  const textCurrentFilterValue = selectedFilterValues.find(
    ({ filterId }) => selectedFilter.id === filterId,
  ) as SearchQueryTextFilterValue | undefined

  const [value, setValue] = useState(
    textCurrentFilterValue ?? {
      type: SearchQueryTextFilterValueTypeEnum.Text,
      mode: SearchQueryTextFilterValueModeEnum.Equal,
      text: '',
      negate: false,
      filterId: selectedFilter.id,
    },
  )

  const selectComponentId = useId()
  const textComponentId = useId()

  useEffect(() => {
    if (
      value.text ||
      value.mode === SearchQueryTextFilterValueModeEnum.Isnull
    ) {
      addOrUpdateFilterValue({
        type: SearchQueryTextFilterValueTypeEnum.Text,
        mode: value.mode,
        text:
          value.mode === SearchQueryTextFilterValueModeEnum.Isnull
            ? undefined
            : value.text,
        negate: value.negate,
        filterId: selectedFilter.id,
      })
    } else {
      removeFilterValue(selectedFilter.id)
    }
  }, [value])

  const negateValue = isSearchMode ? (value.negate ? 'is-not' : 'is') : 'is'
  const modeValue = isSearchMode
    ? value.mode
    : SearchQueryTextFilterValueModeEnum.Equal

  return (
    <div className="flex w-full flex-row flex-wrap items-center gap-1">
      <p>{selectedFilter.name}</p>

      <select
        id={selectComponentId}
        name={selectComponentId}
        value={negateValue}
        disabled={!isSearchMode}
        onChange={(event) =>
          setValue({ ...value, negate: event.target.value === 'is-not' })
        }
        className="block w-fit rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
      >
        <option value="is">is</option>
        <option value="is-not">is not</option>
      </select>

      <select
        id={selectComponentId}
        name={selectComponentId}
        disabled={!isSearchMode}
        value={modeValue}
        onChange={(event) =>
          setValue({
            ...value,
            mode: event.target.value as SearchQueryTextFilterValueModeEnum,
          })
        }
        className="block w-fit max-w-[200px] rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
      >
        {Object.values(SearchQueryTextFilterValueModeEnum).map((textMode) => (
          <option key={textMode} value={textMode}>
            {textMode.toLowerCase()}
          </option>
        ))}
      </select>

      {value.mode !== SearchQueryTextFilterValueModeEnum.Isnull ? (
        <input
          type="text"
          value={value.text}
          name={textComponentId}
          id={textComponentId}
          className="block min-w-[50px] flex-grow rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="enter text to match"
          onChange={(event) => setValue({ ...value, text: event.target.value })}
        />
      ) : null}

      {/* check to close modal or to cancel */}
    </div>
  )
}

export default TextFilter
