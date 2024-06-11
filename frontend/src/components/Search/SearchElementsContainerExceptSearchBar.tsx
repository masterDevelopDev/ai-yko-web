'use client'

import { SearchContext } from '@/contexts/SearchContext'
import { ReactNode, useContext } from 'react'

const SearchElementsContainerExceptSearchBar = ({
  children,
}: {
  children: ReactNode
}) => {
  const { hasTriggeredFirstSearch } = useContext(SearchContext)

  if (hasTriggeredFirstSearch) return <>{children}</>

  return null
}

export default SearchElementsContainerExceptSearchBar
