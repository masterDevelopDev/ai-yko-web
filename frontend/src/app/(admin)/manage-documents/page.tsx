'use client'

import Pagination from '@/components/Search/Pagination'
import Publication from '@/components/Search/Publication'
import SearchBar from '@/components/Search/SearchBar'
import SearchResultsActions from '@/components/Search/SearchResultsActions'
import SearchResultsNumber from '@/components/Search/SearchResultsNumber'
import { SearchContext } from '@/contexts/SearchContext'
import { useContext, useEffect } from 'react'

export default function ManageDocuments() {
  const {
    searchResults,
    isSearchPending,
    hasTriggeredFirstSearch,
    setResultsDisplayMode,
  } = useContext(SearchContext)

  const noResults =
    !isSearchPending && hasTriggeredFirstSearch && searchResults.length === 0

  useEffect(() => {
    setResultsDisplayMode('list')
  }, [])

  return (
    <div className="bg-white p-5">
      <div className="flex w-full items-center justify-center">
        <SearchBar />
      </div>

      <div className="flex flex-row flex-wrap items-center justify-end gap-x-3">
        <SearchResultsActions />

        {noResults || !hasTriggeredFirstSearch ? null : <SearchResultsNumber />}
      </div>

      <div className="flex w-full justify-center">
        {isSearchPending ? <p className="mt-4">Loading...</p> : null}

        {noResults ? <p className="mt-4">No results.</p> : null}
      </div>

      <Pagination />

      <div className="flex flex-col gap-3 p-8 py-12">
        {searchResults.map((sr) => (
          <Publication mode={'ADMIN'} document={sr} key={sr.id} />
        ))}
      </div>

      <Pagination />
    </div>
  )
}
