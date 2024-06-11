'use client'

import { Suspense, lazy, useEffect, useState } from 'react'
import {
  SearchQueryDateFilterValueModeEnum,
  SearchQueryYearFilterValue,
} from '@/lib/axios-client'
import clsx from 'clsx'
import { MODE_TO_SYMBOL } from './utils'
import { FilterAndFilterValuesAndFunctions } from '../getFilterOrFilterGroupComponent'

const YearPicker = lazy(() => import('./components/DatePicker/Year'))
const YearRangePicker = lazy(() => import('./components/DatePicker/YearRange'))

const YEAR_PICKING_MODES = [
  { name: 'Year', mode: 'year' },
  { name: 'Period', mode: 'period' },
]

/**
 * @todo: add possibility to pick months => Do this in month picher component
 * @todo: si mode EDITOR, ne pas afficher de periode, seulement le date picker
 * @todo propose values in range mode: last week, last month, etc. cf. video deeplinq
 * @todo before date, after date
 * @todo leq and geq
 * @todo multiple values?
 */
const YearFilter = ({
  selectedFilterOrGroup: selectedFilter,
  addOrUpdateFilterValue,
  selectedFilterValues,
  isSearchMode,
}: FilterAndFilterValuesAndFunctions) => {
  const currentFilterValue = selectedFilterValues.find(
    ({ filterId }) => selectedFilter.id === filterId,
  ) as SearchQueryYearFilterValue | undefined

  const [value, setValue] = useState({
    firstYear: currentFilterValue?.firstYear
      ? new Date(currentFilterValue?.firstYear, 0, 1)
      : null,
    secondYear: currentFilterValue?.secondYear
      ? new Date(currentFilterValue?.secondYear, 0, 1)
      : null,
    mode: currentFilterValue?.mode ?? SearchQueryDateFilterValueModeEnum.Equal,
  })
  const isCurrentModePeriod = !!value?.secondYear

  const [isPeriod, setIsPeriod] = useState(isCurrentModePeriod)

  useEffect(() => {
    if (value.firstYear) {
      addOrUpdateFilterValue({
        type: 'YEAR',
        filterId: selectedFilter.id,
        firstYear: value.firstYear.getFullYear(),
        secondYear: value.secondYear?.getFullYear() ?? undefined,
        mode: isSearchMode && !isPeriod ? value.mode : undefined,
      } as SearchQueryYearFilterValue)
    }
  }, [value])

  return (
    <div className="flex w-full flex-col items-center gap-2 md:flex-col-reverse">
      <div className="flex flex-col items-center gap-2">
        {isPeriod || !isSearchMode ? null : (
          <div className="mx-auto flex w-1/2 flex-row items-center justify-betweeng gap-1">
            {Object.entries(MODE_TO_SYMBOL).map(([mode, symbol]) => (
              <button
                onClick={() =>
                  setValue({
                    ...value,
                    mode: mode as SearchQueryDateFilterValueModeEnum,
                  })
                }
                className={clsx(
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
          <Suspense fallback={<div>Loading year picker...</div>}>
            {isPeriod && isSearchMode ? (
              <YearRangePicker
                value={[value.firstYear, value.secondYear]}
                setValue={(dateRange) =>
                  setValue({
                    ...value,
                    firstYear: dateRange[0] ?? value.firstYear,
                    secondYear: dateRange[1],
                  })
                }
              />
            ) : (
              <YearPicker
                value={value.firstYear}
                setValue={(date) =>
                  setValue({
                    ...value,
                    firstYear: date ?? value.firstYear,
                    secondYear: null,
                  })
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
                year or period
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
                  setValue({ ...value, secondYear: null })
                }}
                value={isPeriod ? 'period' : 'year'}
              >
                {YEAR_PICKING_MODES.map((yearPickingMode) => (
                  <option
                    value={yearPickingMode.mode}
                    key={yearPickingMode.mode}
                  >
                    {yearPickingMode.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="flex space-x-4" aria-label="Tabs">
                {YEAR_PICKING_MODES.map((yearPickingMode) => (
                  <div
                    onClick={() =>
                      setIsPeriod(yearPickingMode.mode === 'period')
                    }
                    key={yearPickingMode.name}
                    className={clsx(
                      yearPickingMode.mode === (isPeriod ? 'period' : 'year')
                        ? 'bg-gray-100 text-gray-700'
                        : 'text-gray-500 hover:text-gray-700',
                      'rounded-md px-3 py-2 text-sm font-medium',
                    )}
                  >
                    {yearPickingMode.name}
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

export default YearFilter
