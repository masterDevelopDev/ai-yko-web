'use client'

/**
 * @todo switch to https://github.com/AdeleD/react-paginate
 */

import { SearchContext } from '@/contexts/SearchContext'
import { useContext } from 'react'
import { Pagination as MantinePagination } from '@mantine/core'

const Pagination = () => {
  const {
    totalResults,
    page,
    setPage,
    resultsPerPage,
    setResultsPerPage,
    resultsDisplayMode,
    totalPages,
    isSearchPending,
  } = useContext(SearchContext)

  if (isSearchPending) return null

  if (totalResults === 0 || resultsDisplayMode !== 'list') return null

  if (totalPages === 1 && resultsDisplayMode === 'list') return null

  return (
    <div className="flex w-full flex-row items-center justify-between">
      <div></div>

      <MantinePagination total={totalPages} value={page} onChange={setPage} />

      <div className="flex flex-col items-center gap-1 md:flex-row">
        <label
          htmlFor="location"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Results per page
        </label>

        <select
          id="results-per-page"
          name="results-per-page"
          className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={resultsPerPage.toString()}
          onChange={(e) =>
            setResultsPerPage(Number(e.target.value) as 10 | 20 | 50 | 100)
          }
        >
          {[10, 20, 50, 100].map((i) => (
            <option value={String(i)} key={i}>
              {i}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default Pagination
