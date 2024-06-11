'use client'

import useFilters from '@/hooks/useFilters'
import useCategories from '@/hooks/useCategories'
import { useEffect, useState } from 'react'
import FilterTree from './FilterTree'
import {
  FilterDtoKindEnum,
  FilterDtoTypeEnum,
  FilterOrFilterGroupDto,
} from '@/lib/axios-client'
import { TextQueryContext } from '@/contexts/TextQueryContext'
import Categories from '@/components/Categories'
import { useDebounce } from '@uidotdev/usehooks'

function filterBy(
  arr: FilterOrFilterGroupDto[],
  query: string,
): FilterOrFilterGroupDto[] {
  return query
    ? arr.reduce((acc: FilterOrFilterGroupDto[], item) => {
        if (item.children?.length) {
          const filtered = filterBy(item.children, query)

          if (filtered.length) return [...acc, { ...item, children: filtered }]
        }

        const { children, ...itemWithoutChildren } = item

        const options =
          item.kind === FilterDtoKindEnum.Filter &&
          (item.type === FilterDtoTypeEnum.MultiChoice ||
            item.type === FilterDtoTypeEnum.SingleChoice)
            ? item.options ?? []
            : []

        const filterNameOrValuesContainQuery = [item.name, ...options].some(
          (s) => s.toLowerCase().includes(query.toLowerCase()),
        )

        return filterNameOrValuesContainQuery
          ? [...acc, itemWithoutChildren]
          : acc
      }, [])
    : arr
}

const ManageFilters = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('generic')

  const { getCategoryName } = useCategories({ withGenericCategory: true })

  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebounce(searchText, 300)

  const { filters, isLoading, filterGroup } = useFilters({
    categoryId: selectedCategoryId,
  })

  const [treeData, setTreeData] = useState(
    filterGroup ?? {
      name: 'All filters',
      id: 'root',
      children: [],
      kind: 'GROUP',
    },
  )

  const textMatches = (s: string) =>
    debouncedSearchText !== '' &&
    s.toLowerCase().includes(debouncedSearchText.toLowerCase())

  const textMatchesOrMatchesAtLeastOneChild = (
    fofg: FilterOrFilterGroupDto,
  ) => {
    return (
      textMatches(fofg.name) ||
      !!fofg.options?.some(textMatches) ||
      !!fofg.children?.some(textMatchesOrMatchesAtLeastOneChild)
    )
  }

  useEffect(() => {
    if (debouncedSearchText) {
      setTreeData({
        ...filterGroup,
        children: filterBy(filterGroup.children ?? [], debouncedSearchText),
      })
    } else {
      setTreeData(filterGroup)
    }
  }, [debouncedSearchText, filterGroup])

  return (
    <div className="max-w-[100vw] overflow-x-scroll p-4 sm:overflow-x-auto md:p-12">
      <div className="flex w-full flex-col gap-2 md:flex-row md:justify-between">
        <h1 className="text-2xl font-semibold">Manage filters</h1>
      </div>

      <div className="flex w-full flex-col items-center gap-2">
        <div className="mx-auto flex w-fit max-w-2xl flex-row flex-wrap items-center justify-between gap-2 pb-3 pt-3">
          <strong className="font-semibold text-gray-900">
            Select filters for:{' '}
          </strong>

          <Categories
            categoryIdToShow={selectedCategoryId}
            internalCategoryId={selectedCategoryId}
            setInternalCategoryId={setSelectedCategoryId}
            withGenericCategory
          />
        </div>

        <div className="mx-auto w-full max-w-md">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            type="search"
            name="search"
            id="search"
            className="block w-full rounded-full border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search filter or group by name"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {filters.length === 0 ? (
          <p>{isLoading ? 'Loading...' : `You do not have any filters`}</p>
        ) : (
          <TextQueryContext.Provider
            value={{
              text: debouncedSearchText,
              textMatches,
              textMatchesOrMatchesAtLeastOneChild,
            }}
          >
            <FilterTree
              nameToUse={getCategoryName(selectedCategoryId ?? '') + ' filters'}
              filterOrGroup={treeData}
              initialIsOpen
            />
          </TextQueryContext.Provider>
        )}
      </div>
    </div>
  )
}

export default ManageFilters
