'use client'

import { SearchContext } from '../../contexts/SearchContext'
import useSearch from '@/hooks/useSearch'

const SearchLayout = ({ children }: { children: React.ReactNode }) => {
  const search = useSearch()

  return (
    <SearchContext.Provider
      value={{
        ...search,
        mode: 'SEARCH',
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export default SearchLayout
