'use client'

import ImageCarousel from '@/components/ImageCarousel'
import ModalButton from '@/components/ModalButton'
import {
  SearchQueryDtoFilterValuesInner,
  SearchResultDto,
  UpdateDocumentDto,
} from '@/lib/axios-client'
import {
  ArrowDownTrayIcon,
  EyeIcon,
  HeartIcon,
  PencilIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import { saveAs } from 'file-saver'
import { ChangeEventHandler, Suspense, lazy, useContext, useState } from 'react'
import { LOADING_PDF_MESSAGE } from '../../components/PdfViewer'
import clsx from 'clsx'
import { SearchContext } from '@/contexts/SearchContext'
import { useDisclosure } from '@mantine/hooks'
import SelectFiltersModal from '../SelectFiltersModal'
import useFilterValues from '@/hooks/useFilterValues'
import useSelectedFilterOrGroup from '@/hooks/useSelectedFilterOrGroup'
import useFilters from '@/hooks/useFilters'
import { useMutation } from '@tanstack/react-query'
import { ApiClient } from '@/lib/api-client'
import { formatSearchFilterValueForDocumentCreation } from '@/lib/format-search-filter-values'
import SubmitButtonWithLoader from '../SubmitButtonWithLoader'
import { notifySuccess } from '@/app/settings/notify'
import FilterBadge from '../Filters/FilterBadge'
import useUser from '@/hooks/useUser'
import isEqual from 'lodash.isequal'
import useFavorites from '@/hooks/useFavorites'
import useCategories from '@/hooks/useCategories'
import { classnames } from '@/styles/classnames'
import Modal from '../Modal'

const PdfViewer = lazy(() => import('../../components/PdfViewer'))

export const updateDocumentFilters = async (data: UpdateDocumentDto) => {
  const response = await ApiClient.document.documentControllerUpdate(data)

  return response.data
}

const Publication = ({
  document: d,
  isCarouselMode = false,
  mode = 'USER',
}: {
  document: SearchResultDto
  isCarouselMode?: boolean
  mode?: 'USER' | 'ADMIN'
}) => {
  const [doc, setDoc] = useState(d)

  const handleDownloadFileFromUrl = () => {
    saveAs(doc.url, doc.url.split('/').at(-1), {
      autoBom: true,
    })
  }

  const [opened, { open, close }] = useDisclosure(false)

  const [openedImageModal, { open: openImageModal, close: closeImageModal }] =
    useDisclosure(false)

  const { getCategoryName } = useCategories()

  const categoryName = getCategoryName(doc.categoryId)

  const {
    addSelectedPublication,
    removeSelectedPublication,
    isSelectedPublicationId,
    selectedFilterValues: selectedFilterValuesOfQuery,
    mode: componentMode,
  } = useContext(SearchContext)

  const selectedFilterValuesOfQueryFilterIds = selectedFilterValuesOfQuery.map(
    ({ filterId }) => filterId,
  )

  const checked = isSelectedPublicationId(doc.id)

  const { getFilterName } = useFilters({ categoryId: doc.categoryId })

  const { addOrUpdateFilterValue, removeFilterValue, selectedFilterValues } =
    useFilterValues(doc.filterValues ?? [])

  const isFilterIdInQuery = (id: string) => {
    return selectedFilterValuesOfQueryFilterIds.includes(id)
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateDocumentFilters({
        ids: [doc.id],
        filters: selectedFilterValues.map(
          formatSearchFilterValueForDocumentCreation,
        ),
        deletePreviousFilters: true,
      }),
    onSuccess: ([updatedDoc]) => {
      notifySuccess({
        title: 'Document updated successfully',
        message: 'The document was updated and re-indexed successfully',
      })

      setDoc(updatedDoc)
    },
  })

  const { selectedFilterOrGroup, setSelectedFilterOrGroup, isLoading } =
    useSelectedFilterOrGroup(doc.categoryId ?? '')

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    event.stopPropagation()

    if (event.target.checked) {
      addSelectedPublication(doc.id)
    } else {
      removeSelectedPublication(doc.id)
    }
  }

  const { isFavorite, markAsFavorite, removeFromFavorites } = useFavorites(
    doc.id,
  )

  const imageUrls = (doc.images ?? []).map(({ url }) => url)

  const sortedSelectedFilterValues = selectedFilterValues.toSorted(
    (fv1, fv2) => {
      if (selectedFilterValuesOfQueryFilterIds.includes(fv1.filterId)) return -1
      if (selectedFilterValuesOfQueryFilterIds.includes(fv2.filterId)) return 1
      return 0
    },
  )

  const deletedFilterValues =
    componentMode === 'MANAGE_DOCUMENTS'
      ? doc.filterValues.filter((fv) => {
          const fvInSelectedFilterValues = selectedFilterValues.find(
            (fvs) => fvs.filterId === fv.filterId,
          )

          return !fvInSelectedFilterValues
        })
      : []

  const isUpdatedFilterValue = (
    filterValue: SearchQueryDtoFilterValuesInner,
  ) => {
    const filterValueInInitialDoc = doc.filterValues.find(
      (fv) => fv.filterId === filterValue.filterId,
    )

    if (!filterValueInInitialDoc) return true

    return !isEqual(filterValue, filterValueInInitialDoc)
  }

  const showSaveButton = !isEqual(doc.filterValues, selectedFilterValues)

  const filterValuesToDisplay =
    componentMode === 'MANAGE_DOCUMENTS'
      ? sortedSelectedFilterValues
      : sortedSelectedFilterValues.filter((fv) =>
          ['year', 'region', 'depot'].includes(fv.filterId),
        )

  return (
    <div
      className={classnames(
        'mb-1 grid w-full border-spacing-2 auto-cols-max items-center  overflow-hidden break-words rounded-md border border-gray-400 p-3 min-h-36',
        isCarouselMode ? 'grid-cols-1 grid-rows-4' : 'grid-cols-6 gap-2',
      )}
    >
      <div
        className={classnames(
          'flex h-full max-h-36 w-full items-center justify-center md:col-span-1',
          {
            'hidden md:block': !isCarouselMode,
          },
          { 'row-span-3': isCarouselMode },
        )}
      >
        <div
          className={classnames('h-full w-full', {
            hidden: imageUrls.length === 0,
          })}
        >
          {isCarouselMode ? (
            <ImageCarousel imageUrls={imageUrls} />
          ) : (
            <>
              <div onClick={openImageModal} className="h-full w-full">
                <ImageCarousel imageUrls={imageUrls} />
              </div>
              <Modal
                onClose={closeImageModal}
                opened={openedImageModal}
                size="90%"
                centered
              >
                <ImageCarousel naturalSize withZoom imageUrls={imageUrls} />
              </Modal>
            </>
          )}
        </div>
      </div>

      <div className="col-span-5 w-full text-sm md:col-span-4">
        <div className="flex w-full flex-row flex-wrap items-center justify-between gap-2 pb-2">
          <p className="text-sm font-bold md:text-lg">
            {doc.filename.replace('.pdf', '')}
          </p>
          {doc.score === 1 ? null : (
            <p className="italic text-gray-600">Score: {doc.score}</p>
          )}
        </div>

        <div className="flex flex-row flex-wrap items-center gap-2">
          <span className="md: text-md inline-flex items-center rounded-md bg-gray-900 px-2 py-1 text-xs font-semibold text-white">
            {categoryName}
          </span>

          {filterValuesToDisplay.map((fv) => (
            <FilterBadge
              key={fv.filterId}
              filterName={getFilterName(fv.filterId)}
              filterValue={fv}
              removeFilterValue={
                mode === 'ADMIN'
                  ? () => removeFilterValue(fv.filterId)
                  : undefined
              }
              className={clsx({
                'bg-yellow-400 text-yellow-700 ring-yellow-600/20':
                  isUpdatedFilterValue(fv),
                'bg-indigo-400 text-indigo-700 ring-indigo-600/20':
                  isFilterIdInQuery(fv.filterId),
              })}
            />
          ))}

          {deletedFilterValues.map((fv) => (
            <FilterBadge
              key={fv.filterId}
              filterName={getFilterName(fv.filterId)}
              filterValue={fv}
              removeFilterValue={
                mode === 'ADMIN' ? () => addOrUpdateFilterValue(fv) : undefined
              }
              className="bg-red-500"
            />
          ))}
        </div>
      </div>

      <div
        className={classnames(
          'flex h-full items-end',
          isCarouselMode
            ? 'flex-row-reverse justify-start gap-2'
            : 'flex-col justify-between',
        )}
      >
        <div>
          <input
            aria-describedby="document-selected"
            type="checkbox"
            className={classnames(
              'h-6 w-6 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 sm:h-8 sm:w-8',
              { hidden: componentMode === 'FAVORITES' },
            )}
            checked={checked}
            onChange={handleChange}
          />
        </div>

        <div
          className={classnames(
            'flex items-center gap-2 md:flex-row',
            isCarouselMode ? 'flex-row' : 'flex-col',
          )}
        >
          {isCarouselMode ? null : (
            <div className="block md:hidden">
              <ModalButton
                classeNames={{
                  panel: 'h-fit max-w-3xl',
                  button: 'w-full h-full',
                }}
                buttonContent={
                  <PhotoIcon className="h-8 w-8 cursor-pointer rounded-md border border-black p-2 sm:h-10 sm:w-10" />
                }
                modalContent={<ImageCarousel imageUrls={imageUrls} />}
              />
            </div>
          )}

          {mode === 'ADMIN' ? (
            <>
              {!showSaveButton ? null : (
                <SubmitButtonWithLoader
                  type="button"
                  text="Save changes"
                  isLoading={isPending}
                  onClick={mutate}
                />
              )}

              {isLoading ? null : (
                <>
                  <button onClick={open}>
                    <PencilIcon className="h-8 w-8 cursor-pointer rounded-md border border-black p-2 sm:h-10 sm:w-10" />
                  </button>

                  <SelectFiltersModal
                    title="Update document filters"
                    opened={opened}
                    onClose={close}
                    selectedFilterValues={selectedFilterValues}
                    removeFilterValue={removeFilterValue}
                    setSelectedFilterOrGroup={setSelectedFilterOrGroup}
                    selectedFilterOrGroup={selectedFilterOrGroup}
                    addOrUpdateFilterValue={addOrUpdateFilterValue}
                    categoryId={doc.categoryId}
                    getFilterName={getFilterName}
                    pdfUrl={doc.url}
                  />
                </>
              )}
            </>
          ) : null}

          <ModalButton
            buttonContent={
              <EyeIcon className="h-8 w-8 cursor-pointer rounded-md border border-black p-2 sm:h-10 sm:w-10" />
            }
            modalContent={
              <Suspense fallback={<div>{LOADING_PDF_MESSAGE}</div>}>
                <PdfViewer url={doc.url} />
              </Suspense>
            }
            classeNames={{
              panel: 'w-full md:max-w-5xl pt-12',
            }}
          />

          <ArrowDownTrayIcon
            onClick={handleDownloadFileFromUrl}
            className="h-8 w-8 cursor-pointer rounded-md border border-black p-2 sm:h-10 sm:w-10"
          />

          {mode === 'ADMIN' ? null : (
            <HeartIcon
              onClick={
                isFavorite
                  ? () => removeFromFavorites()
                  : () => markAsFavorite()
              }
              className={clsx(
                'rounded-m h-9 w-9 cursor-pointer p-2 sm:h-10 sm:w-10',
                isFavorite ? 'fill-red-400 stroke-red-400' : 'stroke-black',
              )}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Publication
