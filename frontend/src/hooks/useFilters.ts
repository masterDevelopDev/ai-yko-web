import { DUMMY_ROOT_FILTER } from '@/components/Search/utils'
import { ApiClient } from '@/lib/api-client'
import {
  FilterOrFilterGroupDto,
  FilterOrFilterGroupDtoKindEnum,
} from '@/lib/axios-client'
import { useQuery } from '@tanstack/react-query'
import useCategories from './useCategories'

export const getFilters = async (
  query: string,
  categoryId: string,
  groupsOnly: string,
) => {
  const response = await ApiClient.filters.filtersControllerFindAll(
    query,
    groupsOnly,
    categoryId,
  )

  return response.data
}

const getFiltersTree = async (categoryId: string) => {
  const response =
    await ApiClient.filters.filtersControllerGetFiltersTree(categoryId)

  const data = response.data

  return data
}

type Props = { query?: string; categoryId?: string; groupsOnly?: boolean }

const useFilters = (props?: Props) => {
  const {
    query,
    categoryId,
    groupsOnly = false,
  } = props ?? { groupsOnly: false }

  const { getCategoryName } = useCategories({ withGenericCategory: true })

  const { data: filters = [] } = useQuery({
    queryKey: ['FILTERS', query, categoryId, groupsOnly],
    queryFn: () =>
      getFilters(query ?? '', categoryId ?? 'generic', String(groupsOnly)),
  })

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ['FILTERS', 'TREE', categoryId],
    queryFn: () => getFiltersTree(categoryId ?? 'generic'),
  })

  const {
    data: dataGeneric,
    isLoading: isLoadingGeneric,
    isSuccess: isSuccessGeneric,
    isError: isErrorGeneric,
  } = useQuery({
    queryKey: ['FILTERS', 'TREE'],
    queryFn: () => getFiltersTree('generic'),
  })

  const getFilterOrGroupFromId = (
    id: string,
    generic = false,
  ): FilterOrFilterGroupDto => {
    const loading = generic ? isLoadingGeneric : isLoading
    const success = generic ? isSuccessGeneric : isSuccess
    const map = generic ? dataGeneric?.mapping : data?.mapping
    const fg = generic ? dataGeneric?.filterGroup : data?.filterGroup

    if (!map && loading)
      return { id: 'loading', kind: 'FILTER', name: 'Loading' }

    if (!map && !success) return { id: 'error', kind: 'FILTER', name: 'Error' }

    if (id === 'root') return fg ?? DUMMY_ROOT_FILTER

    const path = map![id].path

    const restOfParentIds = path.slice(1) ?? []

    let filterOrFilterGroup = fg as FilterOrFilterGroupDto

    if (path.length > 1) {
      for (const parentId of restOfParentIds) {
        if (
          filterOrFilterGroup !== undefined &&
          filterOrFilterGroup.kind === FilterOrFilterGroupDtoKindEnum.Group
        ) {
          filterOrFilterGroup = filterOrFilterGroup
          filterOrFilterGroup = filterOrFilterGroup?.children?.find(
            (c) => c.id === parentId,
          )!
        }
      }
    }

    return filterOrFilterGroup
  }

  const getFilterName = (filterId: string, withCategory?: boolean): string => {
    if (isLoading) return 'Loading'

    if (!isSuccess) return 'Error'

    let prefix = ''

    if (withCategory) {
      const categoryId = data.mapping?.[filterId]?.categoryId

      if (categoryId) {
        const categoryName = getCategoryName(categoryId ?? '')

        prefix = categoryName + ' / '
      }
    }

    try {
      return (
        prefix +
        data.mapping?.[filterId]?.path
          .slice(1)
          .map((id) => data.mapping?.[id]?.name)
          .join(' / ')
      )
    } catch {
      return filterId
    }
  }

  return {
    filters,
    isLoading,
    isError,
    mapping: data?.mapping ?? { root: { path: ['root'], name: 'All Filters' } },
    filterGroup: data?.filterGroup ?? DUMMY_ROOT_FILTER,
    getFilterName,
    getFilterOrGroupFromId,
  }
}

export default useFilters
