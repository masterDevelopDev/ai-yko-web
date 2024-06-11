'use client'

import { useContext } from 'react'
import Publication from './Publication'
import { SearchContext } from '@/contexts/SearchContext'

const SearchResultsList = () => {
  const { searchResults, isSearchPending } = useContext(SearchContext)

  if (isSearchPending) return <p className="p-10 text-center">Loading...</p>

  if (searchResults.length === 0)
    return <p className="p-10 text-center">No result found</p>

  return (
    <div className="w-full flex-col gap-3 p-3">
      {searchResults.map((d) => (
        <Publication key={d.id} document={d} />
      ))}
    </div>
  )
}

export default SearchResultsList
