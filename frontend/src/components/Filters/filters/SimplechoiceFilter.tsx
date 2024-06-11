'use client'

import { SearchQuerySinglechoiceFilterValue } from '@/lib/axios-client'
import { useEffect, useId, useState } from 'react'
import { FilterAndFilterValuesAndFunctions } from '../getFilterOrFilterGroupComponent'

const SimplechoiceFilter = ({
  selectedFilterOrGroup: selectedFilter,
  addOrUpdateFilterValue,
  selectedFilterValues,
}: FilterAndFilterValuesAndFunctions) => {
  const simplechoiceCurrentFilterValue = selectedFilterValues.find(
    ({ filterId }) => selectedFilter.id === filterId,
  ) as SearchQuerySinglechoiceFilterValue | undefined

  const [value, setValue] = useState(simplechoiceCurrentFilterValue?.choiceId)

  const options = selectedFilter.options ?? []

  const id = useId()

  useEffect(() => {
    if (value) {
      addOrUpdateFilterValue({
        choiceId: value,
        filterId: selectedFilter.id,
        type: 'SINGLE_CHOICE',
      })
    }
  }, [value])

  return (
    <fieldset>
      <div className="divide-gray-200">
        {options.map((option) => (
          <div key={option} className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id={id}
                name={selectedFilter.id}
                type="radio"
                checked={value === option}
                onChange={() => setValue(option)}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor={id} className="font-medium text-gray-900">
                {option}
              </label>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

export default SimplechoiceFilter
