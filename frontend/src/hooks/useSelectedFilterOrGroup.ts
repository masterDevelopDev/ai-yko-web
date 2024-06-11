import { useEffect, useState } from 'react'
import useFilters from './useFilters'
import { FilterOrFilterGroupDto } from '@/lib/axios-client'

const useSelectedFilterOrGroup = (
  categoryId?: string,
  initiallySelectedFilterOrGroup?: FilterOrFilterGroupDto
) => {
  const { filterGroup, isLoading } = useFilters({
    categoryId: categoryId ?? '',
  })

  const [selectedFilterOrGroup, setSelectedFilterOrGroup] =
    useState<FilterOrFilterGroupDto>(
      initiallySelectedFilterOrGroup ?? filterGroup,
    )

  const setRootAsCurrentFilterOrGroup = () => {
    setSelectedFilterOrGroup(filterGroup)
  }

  useEffect(() => {
    if (filterGroup)
      setSelectedFilterOrGroup(initiallySelectedFilterOrGroup ?? filterGroup)
  }, [filterGroup])

  return {
    isLoading,
    selectedFilterOrGroup,
    setSelectedFilterOrGroup,
    setRootAsCurrentFilterOrGroup,
  }
}

export default useSelectedFilterOrGroup
