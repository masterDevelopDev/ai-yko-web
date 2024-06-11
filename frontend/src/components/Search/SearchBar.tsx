'use client'

import ModalButton from '@/components/ModalButton'
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

import Filters from '../../components/Filters'
import FilterBadge from '../../components/Filters/FilterBadge'
import ImagePickerButton from './ImagePickerButton'
import SearchImage from './SearchImage'
import clsx from 'clsx'
import ImageCarousel from '@/components/ImageCarousel'
import { useContext } from 'react'
import { SearchContext } from '@/contexts/SearchContext'

const SearchBar = () => {
  const {
    triggerSearch,
    setRootAsCurrentFilterOrGroup,
    selectedFilterOrGroup,
    addOrUpdateFilterValue,
    removeFilterValue,
    selectedFilterValues,
    searchText,
    setSearchText,
    selectedCategoryId,
    setSelectedCategoryId,

    localImageFiles,
    addLocalImageFiles,
    removeLocalImageFile,

    openModalOnSpecifiedFilter,
    getFilterName,

    savedSearchImages,
    removeAtSavedSearchImage,

    setSelectedFilterOrGroup,
  } = useContext(SearchContext)

  const handleSelectCategoryId = (catId: string) => {
    if (catId === "generic") return

    setSelectedCategoryId(catId)
  }

  const handleRemoveCategoryId = () => {
    setSelectedCategoryId("generic")
  }

  const imageUrls = [
    ...savedSearchImages.map((image) => image.url),
    ...localImageFiles.map((file) => URL.createObjectURL(file)),
  ]

  const showImages = imageUrls.length > 0

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-2">
        <div className="flex h-12 w-full items-center justify-between rounded-2xl border border-gray-300 bg-white px-6 text-sm text-gray-700 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 md:h-16">
          <div className="flex w-full flex-row">
            <input
              required
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              type="text"
              className="h-full w-full rounded-full border-none"
              // @ts-ignore
              style={{ '--tw-ring-color': 'transparent' }}
              placeholder="Search..."
            />

            <div className="mr-2 flex w-fit flex-row items-center justify-end gap-1 md:mr-3 md:gap-2">
              <ModalButton
                classeNames={{ panel: 'md:max-w-xl' }}
                openEventName="open-filters"
                buttonContent={
                  <FunnelIcon
                    onClick={() => setRootAsCurrentFilterOrGroup()}
                    fill="black"
                    color="black"
                    className="w-5 md:w-9"
                  />
                }
                modalContent={
                  <Filters
                    showAllCategories
                    selectedFilterOrGroup={selectedFilterOrGroup}
                    setSelectedFilterOrGroup={setSelectedFilterOrGroup}
                    addOrUpdateFilterValue={addOrUpdateFilterValue}
                    isSearchMode
                    removeFilterValue={removeFilterValue}
                    selectedFilterValues={selectedFilterValues}
                    initialInternalCategoryId={selectedCategoryId}
                    handleSelectCategoryId={handleSelectCategoryId}
                    onClickRemoveCategoryId={handleRemoveCategoryId}
                  />
                }
              />

              <ImagePickerButton addFiles={addLocalImageFiles} />
            </div>
          </div>

          <button
            className={clsx('-mr-6 rounded-r-2xl p-3', 'bg-indigo-400')}
            onClick={() => triggerSearch()}
          >
            <MagnifyingGlassIcon color="white" className="w-6 md:w-10" />
          </button>
        </div>

        <div className="flex w-full flex-row flex-wrap items-center justify-start gap-1 px-2">
          {selectedCategoryId !== 'generic' ? (
            <span className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              {selectedCategoryId}
              <button
                onClick={() => setSelectedCategoryId('generic')}
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

          {selectedFilterValues.map((filterValue) => (
            <FilterBadge
              key={filterValue.filterId}
              onClick={() => openModalOnSpecifiedFilter(filterValue.filterId)}
              removeFilterValue={() => removeFilterValue(filterValue.filterId)}
              filterValue={filterValue}
              filterName={getFilterName(filterValue.filterId)}
            />
          ))}
        </div>

        <div
          className={clsx(
            'mt-2 flex min-h-[2rem] w-full flex-row flex-wrap items-center justify-start gap-3 px-2',
            { hidden: !showImages },
          )}
        >
          {savedSearchImages.map((image, idx: number) => (
            <ModalButton
              key={image.id}
              classeNames={{
                panel: clsx('pt-12 h-[95vh] w-fit'),
              }}
              buttonContent={
                <SearchImage
                  url={image.url}
                  removeImageUrl={() => {
                    removeAtSavedSearchImage(
                      savedSearchImages.findIndex((i) => i.id === image.id),
                    )
                  }}
                />
              }
              modalContent={
                <ImageCarousel initialIndex={idx} imageUrls={imageUrls} />
              }
            />
          ))}

          {localImageFiles.map((file: File, idx: number) => (
            <ModalButton
              key={String(file)}
              classeNames={{
                panel: clsx('pt-12 h-[95vh] w-fit'),
              }}
              buttonContent={
                <SearchImage
                  url={URL.createObjectURL(file)}
                  removeImageUrl={() => removeLocalImageFile(file)}
                />
              }
              modalContent={
                <ImageCarousel initialIndex={idx} imageUrls={imageUrls} />
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchBar
