'use client'

import { Suspense, lazy, useEffect, useState } from 'react'
import {
  SearchQueryDateFilterValue,
  SearchQueryDateFilterValueModeEnum,
} from '@/lib/axios-client'
import { MODE_TO_SYMBOL } from './utils'
import { FilterAndFilterValuesAndFunctions } from '../getFilterOrFilterGroupComponent'
import { formatAsDay, parseDate } from '@/lib/dates'
import { classnames } from '@/styles/classnames'

const DatePicker = lazy(() => import('./components/DatePicker/Simple'))
const DateRangePicker = lazy(() => import('./components/DatePicker/Range'))

const DATE_PICKING_MODES = [
  { name: 'Date', mode: 'date' },
  { name: 'Period', mode: 'period' },
]

const DateFilter = ({
  selectedFilterOrGroup: selectedFilter,
  addOrUpdateFilterValue,
  selectedFilterValues,
  isSearchMode,
}: FilterAndFilterValuesAndFunctions) => {
  const currentFilterValue = selectedFilterValues.find(
    ({ filterId }) => selectedFilter.id === filterId,
  ) as SearchQueryDateFilterValue | undefined

  const [value, setValue] = useState({
    firstDate: currentFilterValue?.firstDate
      ? parseDate(currentFilterValue?.firstDate)
      : null,
    secondDate: currentFilterValue?.secondDate
      ? parseDate(currentFilterValue?.secondDate)
      : null,
    mode: currentFilterValue?.mode ?? SearchQueryDateFilterValueModeEnum.Equal,
  })

  const isCurrentModePeriod = !!value?.secondDate

  const [isPeriod, setIsPeriod] = useState(isCurrentModePeriod)

  useEffect(() => {
    if (value.firstDate) {
      addOrUpdateFilterValue({
        type: 'DATE',
        filterId: selectedFilter.id,
        firstDate: formatAsDay(value.firstDate),
        secondDate: isPeriod ? formatAsDay(value.secondDate) : undefined,
        mode: isSearchMode && !isPeriod ? value.mode : undefined,
      } as SearchQueryDateFilterValue)
    }
  }, [value])

  return (
    <div className="flex w-full flex-col items-center gap-2 md:flex-col-reverse">
      <div>
        {isPeriod || !isSearchMode ? null : (
          <div className="mx-auto flex w-1/2 flex-row items-center justify-between gap-1">
            {Object.entries(MODE_TO_SYMBOL).map(([mode, symbol]) => (
              <button
                onClick={() =>
                  setValue({
                    ...value,
                    mode: mode as SearchQueryDateFilterValueModeEnum,
                  })
                }
                className={classnames(
                  'flex h-7 w-7 items-center justify-center rounded-md border p-1 text-center',
                  {
                    'bg-gray-400': value.mode === mode,
                  },
                )}
                key={mode}
              >
                {symbol}
              </button>
            ))}
          </div>
        )}

        {
          <Suspense fallback={<div>Loading date picker...</div>}>
            {isPeriod && isSearchMode ? (
              <DateRangePicker
                value={[value.firstDate, value.secondDate]}
                setValue={(dateRange) =>
                  setValue({
                    ...value,
                    firstDate: dateRange[0] ?? value.firstDate,
                    secondDate: dateRange[1],
                  })
                }
              />
            ) : (
              <DatePicker
                value={value.firstDate}
                setValue={(date) =>
                  setValue({ ...value, firstDate: date ?? value.firstDate })
                }
              />
            )}
          </Suspense>
        }
      </div>

      {isSearchMode ? (
        <div>
          <div>
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">
                date or period
              </label>
              <select
                id="tabs"
                name="tabs"
                className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(event) => {
                  const newMode = event.target.value
                  if (newMode === 'period') {
                    setIsPeriod(true)
                  }
                  setValue({ ...value, secondDate: null })
                }}
                value={isPeriod ? 'period' : 'date'}
              >
                {DATE_PICKING_MODES.map((datePickingMode) => (
                  <option
                    value={datePickingMode.mode}
                    key={datePickingMode.mode}
                  >
                    {datePickingMode.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="flex space-x-4" aria-label="Tabs">
                {DATE_PICKING_MODES.map((datePickingMode) => (
                  <div
                    onClick={() =>
                      setIsPeriod(datePickingMode.mode === 'period')
                    }
                    key={datePickingMode.name}
                    className={classnames(
                      datePickingMode.mode === (isPeriod ? 'period' : 'date')
                        ? 'bg-gray-100 text-gray-700'
                        : 'text-gray-500 hover:text-gray-700',
                      'rounded-md px-3 py-2 text-sm font-medium',
                    )}
                  >
                    {datePickingMode.name}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DateFilter
