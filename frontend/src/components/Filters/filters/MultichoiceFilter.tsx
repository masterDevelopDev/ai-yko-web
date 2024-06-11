'use client'

import { useEffect, useId, useState } from 'react'

import Fuse from 'fuse.js'
import { XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import classnames from '../../../styles/Scrollbar.module.css'
import { SearchQueryMultichoiceFilterValue } from '@/lib/axios-client'
import { useList } from '@uidotdev/usehooks'
import { FilterAndFilterValuesAndFunctions } from '../getFilterOrFilterGroupComponent'
import { formatAsDay } from '@/lib/dates'

function addElementToList<T>(list: Array<T>, element: T): Array<T> {
  return [...new Set([...list, element])]
}

function removeElementFromList<T>(list: Array<T>, element: T): Array<T> {
  return list.filter((x) => x !== element)
}

const NUMBER_OF_VISIBLE_OPTIONS = 5

const MultichoiceFilter = ({
  selectedFilterOrGroup: selectedFilter,
  addOrUpdateFilterValue,
  removeFilterValue,
  selectedFilterValues,
  counts,
}: FilterAndFilterValuesAndFunctions) => {
  const simplechoiceCurrentFilterValue = selectedFilterValues.find(
    ({ filterId }) => selectedFilter.id === filterId,
  ) as SearchQueryMultichoiceFilterValue | undefined

  const [selectedChoiceIds, { set }] = useList<string>(
    simplechoiceCurrentFilterValue?.choiceIds ?? [],
  )

  const options = selectedFilter.options ?? []

  const id = useId()

  useEffect(() => {
    if (selectedChoiceIds.length > 0) {
      addOrUpdateFilterValue({
        choiceIds: selectedChoiceIds,
        filterId: selectedFilter.id,
        type: 'MULTI_CHOICE',
      })
    }
  }, [selectedChoiceIds])

  const [optionsToDisplay, setOptionsToDisplay] = useState(options)

  const [searchText, setSearchText] = useState('')

  const fuse = new Fuse(options, { threshold: 0.4, keys: ['value'] })

  useEffect(() => {
    if (!searchText || searchText.length === 0) {
      setOptionsToDisplay(options)
      return
    }

    const results = fuse.search(searchText)

    setOptionsToDisplay(results.map(({ item }) => item))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  const getOptionName = (option: string) => {
    if (selectedFilter.id === 'creation-date') {
      return formatAsDay(option)
    }

    return option
  }

  const getOptionNameWithCounts = (option: string) => {
    if (!counts) return getOptionName(option)

    return `${getOptionName(option)} (${counts.find(({ value }) => option === value)?.count ?? 'error'})`
  }

  return (
    <fieldset>
      {options.length > NUMBER_OF_VISIBLE_OPTIONS ? (
        <div className="mb-3">
          <label
            htmlFor="search"
            className="sr-only block text-sm font-medium leading-6 text-gray-900"
          >
            Search option...
          </label>
          <div className="relative mt-2 flex items-center">
            <input
              placeholder="Search options..."
              type="text"
              name="search"
              id="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />

            <XMarkIcon
              onClick={() => setSearchText('')}
              className={clsx('absolute right-2 flex h-5 w-5 cursor-pointer', {
                hidden: searchText === '',
              })}
            />
          </div>
        </div>
      ) : null}
      <div
        className={clsx(classnames['container-with-scrollbar'], 'space-y-2', {
          'max-h-40 overflow-y-auto pl-2':
            optionsToDisplay.length > NUMBER_OF_VISIBLE_OPTIONS,
        })}
      >
        {optionsToDisplay.map((option) => (
          <div key={option} className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id={id}
                name={option}
                checked={selectedChoiceIds.includes(option)}
                onChange={(event) => {
                  if (event.target.checked) {
                    set(addElementToList(selectedChoiceIds, option))
                  } else {
                    const newValues = removeElementFromList(
                      selectedChoiceIds,
                      option,
                    )

                    if (newValues.length === 0) {
                      removeFilterValue(selectedFilter.id)
                      set([])
                    } else {
                      set(newValues)
                    }
                  }
                }}
                type="checkbox"
                className="z-10 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="comments" className="font-medium text-gray-900">
                {getOptionNameWithCounts(option)}
              </label>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

export default MultichoiceFilter
