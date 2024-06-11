'use client'

import useUser from '@/hooks/useUser'
import SubmitButtonWithLoader from '../SubmitButtonWithLoader'
import { useContext } from 'react'
import { SearchContext } from '@/contexts/SearchContext'
import { ApiClient } from '@/lib/api-client'
import { saveAs } from 'file-saver'
import { useMutation } from '@tanstack/react-query'
import useFilterValues from '@/hooks/useFilterValues'
import { useDisclosure } from '@mantine/hooks'
import { formatSearchFilterValueForDocumentCreation } from '@/lib/format-search-filter-values'
import { notifySuccess } from '@/app/settings/notify'
import { updateDocumentFilters } from './Publication'
import { twMerge } from 'tailwind-merge'
import SelectFiltersModal from '../SelectFiltersModal'
import useSelectedFilterOrGroup from '@/hooks/useSelectedFilterOrGroup'

const exportDocumentsWithSelectedIds = async (selectedIds: string[]) => {
  const response = await ApiClient.search.searchControllerExportSearchResult({
    documentIds: selectedIds,
  })

  return response.data
}

const deleteDocumentsByIds = async (ids: string[]) => {
  const response = await ApiClient.document.documentControllerRemove({ ids })

  return response.data
}

// TODO: "export avec select all" possible tant que ca depasse pas une certaine limite (le backend doit gerer cela)

// TODO: apply filters va ouvrir une modale, qui elle se chargera de faire la requete

const SearchResultsActions = () => {
  const { isUserAdmin, isUserAtLeastOperator } = useUser()

  const {
    addOrUpdateFilterValue,
    removeFilterValue,
    selectedFilterValues,
    resetFilterValues,
  } = useFilterValues()

  const [opened, { open, close }] = useDisclosure(false)

  const {
    areAllResultsSelected,
    selectedPublications,
    unselectAllSelectedResults,
    selectAllResults,
    totalResults,
    mode,
    triggerSearch,
    selectedCategoryId,
    getFilterName,
    searchResults,
  } = useContext(SearchContext)

  const numberOfSelectedResults = selectedPublications.length

  const {
    mutate: updateSelectedDocumentFilters,
    isPending: isUpdatingSelectedDocumentFilters,
  } = useMutation({
    mutationFn: () =>
      updateDocumentFilters({
        /** @todo rename to selectedPublicationIds */
        ids: selectedPublications,
        filters: selectedFilterValues.map(
          formatSearchFilterValueForDocumentCreation,
        ),
        deletePreviousFilters: false,
      }),
    onSuccess: () => {
      unselectAllSelectedResults()

      resetFilterValues()

      notifySuccess({
        title: 'Documents updated successfully',
        message: 'The documents were updated and re-indexed successfully',
      })

      triggerSearch()
      triggerSearch()
    },
  })

  const { selectedFilterOrGroup, setSelectedFilterOrGroup } =
    useSelectedFilterOrGroup(selectedCategoryId ?? '')

  const { mutate: exportSelectedResults, isPending: isExporting } = useMutation(
    {
      mutationFn: () => exportDocumentsWithSelectedIds(selectedPublications),
      onSuccess: (exportUrl) => {
        saveAs(exportUrl, exportUrl.split('/').at(-1), {
          autoBom: true,
        })

        unselectAllSelectedResults()
      },
    },
  )

  const { mutate: deleteSelectedResults, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteDocumentsByIds(selectedPublications),
    onSuccess: () => {
      unselectAllSelectedResults()
      triggerSearch()
      triggerSearch()
    },
  })

  const canModifyFilterValues =
    mode === 'MANAGE_DOCUMENTS' &&
    isUserAtLeastOperator &&
    (selectedPublications.length >= 1 || areAllResultsSelected) &&
    selectedCategoryId

  const actions = [
    {
      name: `Select all results (${searchResults.length})`,
      visible: !areAllResultsSelected,
      isLoading: false,
      action: selectAllResults,
    },
    {
      name: 'Unselect all',
      visible: areAllResultsSelected || selectedPublications.length >= 2,
      isLoading: false,
      action: unselectAllSelectedResults,
    },
    {
      name: `Export selected (${numberOfSelectedResults})`,
      visible:
        mode === 'SEARCH' &&
        (selectedPublications.length > 0 || areAllResultsSelected),
      isLoading: isExporting,
      action: exportSelectedResults,
    },
    {
      name: 'Delete selected',
      visible:
        mode === 'MANAGE_DOCUMENTS' &&
        isUserAdmin &&
        selectedPublications.length > 0,
      isLoading: isDeleting,
      action: deleteSelectedResults,
    },
    {
      name: 'Select filters to apply to results',
      visible: canModifyFilterValues,
      isLoading: false,
      action: open,
    },
    {
      name: 'Apply filters',
      visible: canModifyFilterValues && selectedFilterValues.length > 0,
      isLoading: isUpdatingSelectedDocumentFilters,
      action: updateSelectedDocumentFilters,
    },
  ]

  const visibleActions = actions.filter(({ visible }) => visible)

  if (totalResults === 0) return null

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {visibleActions.map(({ name, isLoading, action }) => (
        <SubmitButtonWithLoader
          key={name}
          isLoading={isLoading}
          text={name}
          type="button"
          onClick={action}
          className={twMerge(
            'px-1 py-0.5 md:px-2 md:py-2',
            isLoading ? 'cursor-not-allowed bg-gray-500' : '',
          )}
        />
      ))}

      {canModifyFilterValues ? (
        <SelectFiltersModal
          title="Update documents filters"
          opened={opened}
          onClose={close}
          selectedFilterValues={selectedFilterValues}
          removeFilterValue={removeFilterValue}
          setSelectedFilterOrGroup={setSelectedFilterOrGroup}
          selectedFilterOrGroup={selectedFilterOrGroup}
          addOrUpdateFilterValue={addOrUpdateFilterValue}
          categoryId={selectedCategoryId}
          getFilterName={getFilterName}
        />
      ) : null}
    </div>
  )
}

export default SearchResultsActions
