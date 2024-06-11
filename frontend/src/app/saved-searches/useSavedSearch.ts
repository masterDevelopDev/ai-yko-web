import { ApiClient } from '@/lib/api-client'
import { UpdateSavedSearchDto } from '@/lib/axios-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SAVED_SEARCHES_QUERY_KEY } from './utils'

const updateSavedSearch = async (id: number, data: UpdateSavedSearchDto) => {
  const response = await ApiClient.search.searchControllerUpdateSavedSearch(
    String(id),
    data,
  )

  return response.data
}

const deleteSavedSearch = async (id: number) => {
  const response =
    await ApiClient.search.searchControllerDeleteSavedSearchQuery(String(id))

  return response.data
}

const useSavedSearch = (id: number) => {
  const queryClient = useQueryClient()

  const { mutate: mutateSavedSearchUpdate, isPending: isUpdatingSavedSearch } =
    useMutation({
      mutationFn: async (data: UpdateSavedSearchDto) =>
        updateSavedSearch(id, data),
    })

  const { mutate: mutateSavedSearchRemove, isPending: isDeletingSavedSearch } =
    useMutation({
      mutationFn: async (id: number) => deleteSavedSearch(id),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: SAVED_SEARCHES_QUERY_KEY }),
    })

  return {
    mutateSavedSearchRemove,
    mutateSavedSearchUpdate,
    isUpdatingSavedSearch,
    isDeletingSavedSearch,
  }
}

export default useSavedSearch
