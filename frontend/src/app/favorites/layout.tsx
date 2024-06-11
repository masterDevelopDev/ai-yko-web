'use client'

import { SearchContext } from '@/contexts/SearchContext'
import useSearch from '@/hooks/useSearch'

const FavoritesLayout = ({ children }: { children: React.ReactNode }) => {
  const search = useSearch()

  return (
    <SearchContext.Provider
      value={{
        ...search,
        mode: 'FAVORITES',
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export default FavoritesLayout
