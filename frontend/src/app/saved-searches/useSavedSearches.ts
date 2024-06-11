import { useQuery } from '@tanstack/react-query'
import { SAVED_SEARCHES_QUERY_KEY } from './utils'
import { ApiClient } from '@/lib/api-client'

const getSavedSearches = async () => {
  const response =
    await ApiClient.search.searchControllerGetSavedSearchQueries()

  return response.data
}

const useSavedSearches = () => {
  const { data: savedSearches = [], isLoading: savedSearchesLoading } =
    useQuery({
      queryKey: SAVED_SEARCHES_QUERY_KEY,
      queryFn: () => getSavedSearches(),
    })

  return {
    savedSearches,
    savedSearchesLoading,
  }
}

export default useSavedSearches
