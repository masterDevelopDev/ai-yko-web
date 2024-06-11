'use client'

import { useContext } from 'react'
import SearchResultsCarousel from '../SearchResultsCarousel'
import SearchResultsList from '../SearchResultsList'

import { SearchContext } from '@/contexts/SearchContext'

const SearchResults = () => {
  const { resultsDisplayMode, selectedPublications, totalResults } =
    useContext(SearchContext)

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto">
      {resultsDisplayMode === 'list' ? (
        <SearchResultsList />
      ) : (
        <SearchResultsCarousel />
      )}
    </div>
  )
}

export default SearchResults
