import { ApiClient } from '@/lib/api-client'
import { useQuery } from '@tanstack/react-query'

export const getUserCategories = async () => {
  const response = await ApiClient.filters.filtersControllerGetCategories()

  return response.data
}

interface Props {
  withGenericCategory: boolean
}

const useCategories = (props?: Props) => {
  const { withGenericCategory = false } = props ?? {}

  const QUERY_KEY = ['USER_CATEGORIES']

  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getUserCategories(),
  })

  const categoriesToReturn = withGenericCategory
    ? categories
    : categories.filter((c) => c.id !== 'generic')

  const getCategoryName = (categoryId: string) => {
    const name =
      categoriesToReturn.find(({ id }) => id === categoryId)?.name ??
      'category name not found'

    return name
  }

  return { categories: categoriesToReturn, getCategoryName }
}

export default useCategories
