'use client'

import { SearchContext } from '@/contexts/SearchContext'
import { useContext } from 'react'

const SearchResultsNumber = () => {
  const { totalResults, isSearchPending, totalResultsMoreThan } =
    useContext(SearchContext)

  if (isSearchPending) return null

  return (
    <div>
      <p className="w-full text-end italic">{`${totalResultsMoreThan ? 'More than ' : ''}${totalResults} result${totalResults > 1 ? 's' : ''}`}</p>
    </div>
  )
}

export default SearchResultsNumber
