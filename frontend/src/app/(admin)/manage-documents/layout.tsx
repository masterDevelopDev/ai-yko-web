'use client'

import { SearchContext } from '@/contexts/SearchContext'
import useSearch from '@/hooks/useSearch'

const ManageDocumentsLayout = ({ children }: { children: React.ReactNode }) => {
  const search = useSearch()

  return (
    <SearchContext.Provider
      value={{
        ...search,
        mode: 'MANAGE_DOCUMENTS',
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export default ManageDocumentsLayout
