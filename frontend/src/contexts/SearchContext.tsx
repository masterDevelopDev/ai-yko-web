'use client'

import { createContext } from 'react'
import {
  FilterOrFilterGroupDto,
  ImageDto,
  RefinementFilterDto,
  SearchQueryDtoFilterValuesInner,
  SearchResultDto,
} from '@/lib/axios-client'
import { DUMMY_ROOT_FILTER } from '@/components/Search/utils'

interface SearchContextValue {
  resultsDisplayMode: 'list' | 'carousel'
  setResultsDisplayMode: (x: 'list' | 'carousel') => void

  selectedPublications: string[]
  addSelectedPublication: (p: string) => void
  removeSelectedPublication: (p: string) => void
  resetSelectedPublications: () => void
  selectAllResults: () => void
  unselectAllSelectedResults: () => void
  isSelectedPublicationId: (id: string) => boolean
  areAllResultsSelected: boolean

  selectedFilterOrGroup: FilterOrFilterGroupDto
  setSelectedFilterOrGroup: (f: FilterOrFilterGroupDto) => void

  searchText: string
  setSearchText: (s: string) => void

  selectedCategoryId: string
  setSelectedCategoryId: (s: string) => void

  selectedFilterValues: SearchQueryDtoFilterValuesInner[]
  addOrUpdateFilterValue: (fv: SearchQueryDtoFilterValuesInner) => void
  removeFilterValue: (id: string) => void

  setRootAsCurrentFilterOrGroup: () => void

  localImageFiles: File[]
  addLocalImageFiles: (files: File[]) => void
  removeLocalImageFile: (file: File) => void

  searchResults: SearchResultDto[]
  isSearchPending: boolean
  isSearchQueryFinished: boolean
  triggerSearch: () => void

  refinementFilters: RefinementFilterDto[]
  isSavedSearch: boolean
  totalResults: number
  totalResultsMoreThan: boolean

  saveSearch: () => void

  openModalOnSpecifiedFilter: (id: string) => void
  getFilterName: (id: string, withCategory?: boolean) => string

  resultsPerPage: number
  setResultsPerPage: (r: 10 | 20 | 50 | 100) => void

  page: number
  setPage: (id: number) => void
  totalPages: number

  savedSearchImages: ImageDto[]
  removeAtSavedSearchImage: (idx: number) => void

  mode: 'MANAGE_DOCUMENTS' | 'SEARCH' | 'FAVORITES'

  hasTriggeredFirstSearch: boolean

  offset: number
  setOffset: (n: number) => void

  limit: number
  setLimit: (n: number) => void

  isQueryWithLocalImages: boolean
}

export const SearchContext = createContext<SearchContextValue>({
  resultsDisplayMode: 'list',
  setResultsDisplayMode: () => {},

  selectedPublications: [],
  addSelectedPublication: () => {},
  removeSelectedPublication: () => {},
  resetSelectedPublications: () => {},
  selectAllResults: () => {},
  unselectAllSelectedResults: () => {},
  isSelectedPublicationId: () => false,
  areAllResultsSelected: false,

  selectedFilterOrGroup: DUMMY_ROOT_FILTER,
  setSelectedFilterOrGroup: () => {},

  searchText: '',
  setSearchText: () => {},

  selectedCategoryId: 'generic',
  setSelectedCategoryId: () => {},

  selectedFilterValues: [],
  addOrUpdateFilterValue: () => {},
  removeFilterValue: () => {},
  setRootAsCurrentFilterOrGroup: () => {},

  localImageFiles: [],
  addLocalImageFiles: () => {},
  removeLocalImageFile: () => {},

  searchResults: [],
  isSearchPending: false,
  isSearchQueryFinished: false,
  triggerSearch: () => {},

  refinementFilters: [],
  isSavedSearch: false,
  totalResults: 0,
  totalResultsMoreThan: false,

  saveSearch: () => {},

  openModalOnSpecifiedFilter: () => {},
  getFilterName: () => '',

  resultsPerPage: 10,
  setResultsPerPage: () => {},

  page: 1,
  setPage: () => {},
  totalPages: 0,

  savedSearchImages: [],
  removeAtSavedSearchImage: () => {},

  mode: 'SEARCH',

  hasTriggeredFirstSearch: false,

  offset: 0,
  setOffset: () => {},

  limit: 10,
  setLimit: () => {},

  isQueryWithLocalImages: false,
})
