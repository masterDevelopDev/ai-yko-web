'use client'

import Breadcrumbs from './Breadcrumbs'
import getFilterOrFilterGroupComponent from './getFilterOrFilterGroupComponent'
import {
  FilterOrFilterGroupDto,
  SearchQueryDtoFilterValuesInner,
} from '@/lib/axios-client'
import useFilters from '@/hooks/useFilters'
import Categories from '../Categories'
import { useEffect, useState } from 'react'
import useSelectedFilterOrGroup from '@/hooks/useSelectedFilterOrGroup'

export type FiltersComponentProps = {
  selectedFilterOrGroup?: FilterOrFilterGroupDto
  setSelectedFilterOrGroup?: (f: FilterOrFilterGroupDto) => void

  addOrUpdateFilterValue: (f: SearchQueryDtoFilterValuesInner) => void
  removeFilterValue: (filterId: string) => void
  selectedFilterValues: SearchQueryDtoFilterValuesInner[]

  initialInternalCategoryId: string
  initiallySelectedFilterOrGroup?: FilterOrFilterGroupDto
  handleSelectCategoryId?: (categoryId: string) => void
  onClickRemoveCategoryId?: () => void

  categoryIdToShow?: string

  isSearchMode: boolean

  showAllCategories?: boolean
}

export default function Filters({
  addOrUpdateFilterValue,
  removeFilterValue,
  selectedFilterValues,

  initiallySelectedFilterOrGroup,

  initialInternalCategoryId,
  
  handleSelectCategoryId,
  onClickRemoveCategoryId,
  categoryIdToShow,

  isSearchMode,

  showAllCategories = false,
}: FiltersComponentProps) {


  const [internalCategoryId, setInternalCategoryId] =
    useState(initialInternalCategoryId)

  const { isError, isLoading, filterGroup, mapping } = useFilters({
    categoryId: internalCategoryId,
  })

  const { selectedFilterOrGroup, setSelectedFilterOrGroup } =
  useSelectedFilterOrGroup(
    internalCategoryId,
    initiallySelectedFilterOrGroup
  )

  const setRootAsCurrent = () => {
    setSelectedFilterOrGroup(filterGroup)
  }

  let breadcrumbItems = isLoading ? [] : mapping[selectedFilterOrGroup.id].path.map(
    (id: string) => ({
      name: mapping[id].name,
      id,
    }),
  )

  breadcrumbItems =
    selectedFilterOrGroup.id === 'root'
      ? breadcrumbItems
      : breadcrumbItems.filter(({id}) => id !== 'root')

  useEffect(() => {
    if (handleSelectCategoryId){
      handleSelectCategoryId(internalCategoryId)
    }
  }, [internalCategoryId])

  if (isLoading) return <p>Filters loading...</p>

  if (isError) return <p>Error retrieving filters</p>

  return (

      <div>
        <div className="mb-3 flex flex-row flex-wrap items-center justify-between pr-8">
          <Breadcrumbs breadcrumbItems={breadcrumbItems} setRootAsCurrent={setRootAsCurrent} />

          {initialInternalCategoryId !== 'generic' && onClickRemoveCategoryId ? (
            <span className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              {initialInternalCategoryId}
              <button
                onClick={() => onClickRemoveCategoryId()}
                type="button"
                className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20"
              >
                <span className="sr-only">Remove</span>
                <svg
                  viewBox="0 0 14 14"
                  className="h-3.5 w-3.5 stroke-gray-700/50 group-hover:stroke-gray-700/75"
                >
                  <path d="M4 4l6 6m0-6l-6 6" />
                </svg>
                <span className="absolute -inset-1" />
              </button>
            </span>
          ) : null}
        </div>

        <Categories
          internalCategoryId={internalCategoryId}
          setInternalCategoryId={setInternalCategoryId}
          withGenericCategory
          hideOtherCategories={!showAllCategories}
          categoryIdToShow={categoryIdToShow}
        />

        <div className="mt-3 flex flex-col justify-start gap-1 text-start">
          {getFilterOrFilterGroupComponent(
            {
              selectedFilterOrGroup,
              addOrUpdateFilterValue,
              isSearchMode,
              removeFilterValue,
              selectedFilterValues,
            },
            setSelectedFilterOrGroup,
          )}
        </div>
      </div>
  )
}
