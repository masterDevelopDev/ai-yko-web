import { useEffect, useState } from 'react'
import { useDebounce, useList } from '@uidotdev/usehooks'
import useFilters from '@/hooks/useFilters'
import { ImageDto, SearchQueryDtoFilterValuesInner } from '@/lib/axios-client'
import { ApiClient } from '@/lib/api-client'
import axios, { AxiosRequestTransformer } from 'axios'
import { useMutation, useQuery } from '@tanstack/react-query'
import { notifySuccess } from '@/app/settings/notify'
import { useSearchParams } from 'next/navigation'
import useFilterValues from './useFilterValues'
import useSelectedFilterOrGroup from './useSelectedFilterOrGroup'
import { useMediaQuery } from '@mantine/hooks'

type SearchQueryDto = {
  categoryId?: string
  filterValues?: SearchQueryDtoFilterValuesInner[]
  imageFiles?: Array<File>
  limit?: number
  offset?: number
  text?: string
  savedImages?: ImageDto[]
}

const saveSearchApiCall = async (data: SearchQueryDto) => {
  const {
    categoryId,
    filterValues,
    imageFiles,
    savedImages,
    limit,
    offset,
    text,
  } = data

  const searchQueryDtoTransformer: AxiosRequestTransformer = (
    data: FormData,
  ) => {
    data.delete('filterValues')

    data.append('filterValues', JSON.stringify(filterValues))

    data.delete('savedImages')

    if (savedImages) {
      data.append('savedImages', JSON.stringify(savedImages))
    }

    return data
  }

  const response = await ApiClient.search.searchControllerSaveSearchQuery(
    savedImages,
    imageFiles,
    filterValues,
    text,
    limit,
    offset,
    categoryId,
    {
      transformRequest: [searchQueryDtoTransformer].concat(
        axios.defaults.transformRequest ?? [],
      ),
    },
  )

  return response.data
}

const search = async (data: SearchQueryDto) => {
  const {
    categoryId,
    filterValues,
    imageFiles,
    savedImages,
    limit,
    offset,
    text,
  } = data

  const searchQueryDtoTransformer: AxiosRequestTransformer = (
    data: FormData,
  ) => {
    data.delete('filterValues')

    data.append('filterValues', JSON.stringify(filterValues))

    data.delete('savedImages')

    if (savedImages) {
      data.append('savedImages', JSON.stringify(savedImages))
    }

    return data
  }

  const response = await ApiClient.search.searchControllerSearch(
    savedImages,
    imageFiles,
    filterValues,
    text,
    limit,
    offset,
    categoryId,
    {
      transformRequest: [searchQueryDtoTransformer].concat(
        axios.defaults.transformRequest ?? [],
      ),
    },
  )

  return response.data
}

const getSearch = async (id: string) => {
  const response = await ApiClient.search.searchControllerGetSavedSearch(
    String(id),
  )

  return response.data
}

const useSearch = () => {
  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  const [resultsDisplayMode, setResultsDisplayMode] = useState<
    'carousel' | 'list'
  >('list')

  const params = useSearchParams()

  const savedSearchId = params.get('saved_search_id')

  const { data: savedSearch } = useQuery({
    enabled: !!savedSearchId,
    queryKey: ['SAVED_SEARCH', savedSearchId],
    queryFn: () => getSearch(String(savedSearchId)),
  })

  const removeSelectedPublication = (id: string) => {
    removeAtP(selectedPublications.indexOf(id))
  }

  const resetSelectedPublications = () => {
    clearP()
  }

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>('generic')

  const { mapping, getFilterOrGroupFromId, getFilterName, isLoading } = useFilters({
    categoryId: selectedCategoryId,
  })

  const {
    selectedFilterOrGroup,
    setSelectedFilterOrGroup,
    setRootAsCurrentFilterOrGroup,
  } = useSelectedFilterOrGroup(selectedCategoryId)

  const [searchText, setSearchText] = useState('')

  const debouncedSearchText = useDebounce(searchText, 300)

  const {
    addOrUpdateFilterValue,
    removeFilterValue,
    selectedFilterValues,
    setFilterValues,
  } = useFilterValues()

  const [localImageFiles, { push, removeAt }] = useList<File>([])

  const [
    savedSearchImages,
    { set: setSavedSearchImages, removeAt: removeAtSavedSearchImage },
  ] = useList<ImageDto>([])

  const [page, setPage] = useState(1)
  const [resultsPerPage, setResultsPerPage] = useState<10 | 20 | 50 | 100>(20)
  const [limit, setLimit] = useState(10)
  const [offset, setOffset] = useState(0)

  const getLimitAndOffset = () => {
    if (resultsDisplayMode === 'list') {
      return {
        limit: resultsPerPage,
        offset: (page - 1) * resultsPerPage,
      }
    }

    return {
      limit,
      offset,
    }
  }

  const { limit: limitToUse, offset: offsetToUse } = getLimitAndOffset()

  const [hasTriggeredFirstSearch, setHasTriggeredFirstSearch] = useState(false)

  const queryKey = [
    'SEARCH_RESULTS',
    debouncedSearchText,
    selectedCategoryId,
    savedSearchImages,
    selectedFilterValues,
    limitToUse,
    offsetToUse,
    resultsPerPage,
    resultsDisplayMode,
    localImageFiles.map((imgf) => imgf.name),
  ]


  const isSearchEnabled =
    localImageFiles.length === 0 && hasTriggeredFirstSearch

  const {
    refetch,
    data: results,
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey,

    enabled: isSearchEnabled,

    queryFn: () => {
      return search({
        text: debouncedSearchText,
        categoryId: selectedCategoryId,
        savedImages: savedSearchImages,
        filterValues: selectedFilterValues,
        imageFiles: localImageFiles,
        limit: limitToUse,
        offset: offsetToUse,
      })
    },
  })

  const isQueryWithLocalImages = localImageFiles.length > 0

  const searchResults = results?.searchResults ?? []
  const refinementFilters = results?.refinementFilters ?? []
  const totalResults = results?.total ?? 0
  const totalResultsMoreThan = results?.moreThan ?? false
  const totalPages = Math.ceil(totalResults / resultsPerPage)

  const [
    selectedPublications,
    { push: pushP, removeAt: removeAtP, clear: clearP, set: setP },
  ] = useList<string>([])

  const areAllResultsSelected =
    selectedPublications.length === searchResults.length

  const selectAllResults = () => {
    setP(searchResults.map((sr) => sr.id))
  }

  const addSelectedPublication = (id: string) => {
    if (!selectedPublications.includes(id)) {
      pushP(id)
    }
  }

  const unselectAllSelectedResults = () => {
    clearP()
  }

  const isSelectedPublicationId = (id: string) => {
    if (areAllResultsSelected) return true

    return selectedPublications.includes(id)
  }

  const addLocalImageFiles = (files: File[]) => {
    files.map(push)
  }

  const removeLocalImageFile = (file: File) => {
    const fileToRemoveIndex = localImageFiles.findIndex((f) => f === file)

    if (fileToRemoveIndex >= 0) removeAt(fileToRemoveIndex)
  }

  const currentSearch = {
    text: debouncedSearchText,
    categoryId: selectedCategoryId,
    savedImages: savedSearchImages,
    filterValues: selectedFilterValues,
  }

  const [isSavedSearch, setIsSavedSearch] = useState(!!savedSearchId)

  const { mutate: mutateSavedSearch } = useMutation({
    mutationFn: () =>
      saveSearchApiCall({
        ...currentSearch,
        imageFiles: localImageFiles,
      }),
    onSuccess: (data) => {
      notifySuccess({
        title: 'Search was saved',
        message:
          'Your search was successfully saved under the name ' + data.name,
      })

      setIsSavedSearch(true)
    },
  })

  const openModalOnSpecifiedFilter = (id: string) => {
    let filter = getFilterOrGroupFromId(id)

    if (!filter) {
      filter = getFilterOrGroupFromId(id, true)
    }

    if (!filter) return

    setSelectedFilterOrGroup(filter)

    const event = new CustomEvent('open-filters', {
      detail: {
        filterId: id,
      },
    })

    window.dispatchEvent(event)
  }

  const saveSearch = () => {
    if (isSavedSearch) return

    mutateSavedSearch()
  }

  const triggerSearch = () => {
    setHasTriggeredFirstSearch(true)
    refetch()
  }

  useEffect(() => {
    const resultIdsThatAreNoLongerInResults = selectedPublications.filter(
      (sid) => !searchResults.find(({ id }) => id === sid),
    )

    resultIdsThatAreNoLongerInResults.map(removeSelectedPublication)
  }, [searchResults])

  useEffect(() => {
    if (savedSearch) {
      setSelectedCategoryId(savedSearch.categoryId ?? 'generic')

      setSearchText(savedSearch.text ?? '')

      setFilterValues(savedSearch.filterValues)

      setSavedSearchImages(savedSearch.images ?? [])

      setIsSavedSearch(true)

      setHasTriggeredFirstSearch(true)
    }
  }, [savedSearch])

  useEffect(() => {
    if (isFetching) return

    if (totalPages && page > totalPages) {
      setPage(Math.max(1, totalPages))
    }
  }, [totalPages])


  useEffect(() => {
    if (isLoading) return

    
    setFilterValues(
      selectedFilterValues.filter((fv) => {
        const fvCategoryId = mapping[fv.filterId]?.categoryId

        return (
          selectedCategoryId === fvCategoryId || fvCategoryId === 'generic'
        )
      }),
    )
    
  }, [selectedCategoryId, isLoading])

  useEffect(() => {
    setResultsDisplayMode(isSmallScreen ? 'carousel' : 'list')
  }, [isSmallScreen])

  return {
    selectedFilterOrGroup,
    setSelectedFilterOrGroup,
    searchText,
    setSearchText,

    selectedFilterValues,
    addOrUpdateFilterValue,
    removeFilterValue,
    setRootAsCurrentFilterOrGroup,

    resultsDisplayMode,
    setResultsDisplayMode,

    selectedPublications,
    addSelectedPublication,
    removeSelectedPublication,
    resetSelectedPublications,
    selectAllResults,
    unselectAllSelectedResults,
    isSelectedPublicationId,
    areAllResultsSelected,

    selectedCategoryId,
    setSelectedCategoryId,

    localImageFiles,
    addLocalImageFiles,
    removeLocalImageFile,

    searchResults,
    isSearchPending: isFetching,
    isSearchQueryFinished: isSuccess,
    triggerSearch,

    refinementFilters,
    isSavedSearch,
    totalResults,
    totalResultsMoreThan,

    saveSearch,

    openModalOnSpecifiedFilter,
    getFilterName,

    resultsPerPage,
    setResultsPerPage,
    page,
    setPage,
    totalPages,

    savedSearchImages,
    removeAtSavedSearchImage,

    hasTriggeredFirstSearch,

    offset,
    setOffset,

    limit,
    setLimit,

    isQueryWithLocalImages,
  }
}

export default useSearch
