import { ApiClient } from '@/lib/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const FAVORITE_DOCUMENTS_KEY = 'FAVORITE_DOCUMENTS_KEY'
const FAVORITE_DOCUMENTS_IDS_KEY = 'FAVORITE_DOCUMENTS_IDS_KEY'

const retrieveFavoriteDocuments = async () => {
  const response =
    await ApiClient.document.documentControllerGetFavoriteDocuments()

  return response.data
}

const retrieveFavoriteDocumentsIds = async () => {
  const response =
    await ApiClient.document.documentControllerGetFavoriteDocumentIds()

  return response.data
}

const addFavoriteApiCall = async (id: string) => {
  const response = await ApiClient.document.documentControllerMarkAsFavorite(id)

  return response.data
}

const removeFavoriteApiCall = async (id: string) => {
  const response =
    await ApiClient.document.documentControllerRemoveFromFavorites(id)

  return response.data
}

const useFavorites = (documentId?: string) => {
  const { data: favoriteDocumentsIds = [] } = useQuery({
    queryKey: [FAVORITE_DOCUMENTS_IDS_KEY],
    queryFn: () => retrieveFavoriteDocumentsIds(),
    enabled: !!documentId,
  })

  const {
    data: favoriteDocuments = [],
    isLoading: isLoadingFavoriteDocuments,
  } = useQuery({
    queryKey: [FAVORITE_DOCUMENTS_KEY],
    queryFn: () => retrieveFavoriteDocuments(),
    enabled: !documentId,
  })

  const queryClient = useQueryClient()

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [FAVORITE_DOCUMENTS_KEY] })

    queryClient.invalidateQueries({ queryKey: [FAVORITE_DOCUMENTS_IDS_KEY] })
  }

  const addFavorite = async (docId?: string) => {
    if (!docId) return

    queryClient.setQueryData(
      [FAVORITE_DOCUMENTS_IDS_KEY],
      (oldFavoriteIds: string[]) => [
        ...new Set([...oldFavoriteIds, documentId]),
      ],
    )

    return addFavoriteApiCall(docId)
  }

  const { mutate: markAsFavorite } = useMutation({
    mutationFn: () => {
      return addFavorite(documentId)
    },
    onSuccess: () => refresh(),
  })

  const removeFavorite = async (docId?: string) => {
    if (!docId) return

    queryClient.setQueryData(
      [FAVORITE_DOCUMENTS_IDS_KEY],
      (oldFavoriteIds: string[]) =>
        oldFavoriteIds.filter((id) => id !== documentId),
    )

    return removeFavoriteApiCall(docId)
  }

  const { mutate: removeFromFavorites } = useMutation({
    mutationFn: () => {
      return removeFavorite(documentId)
    },
    onSuccess: () => refresh(),
  })

  const isFavorite = documentId
    ? favoriteDocumentsIds.includes(documentId)
    : false

  return {
    isFavorite,
    markAsFavorite,
    removeFromFavorites,
    favoriteDocuments,
    isLoadingFavoriteDocuments,
  }
}

export default useFavorites
