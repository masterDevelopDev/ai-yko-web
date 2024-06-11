'use client'

import { useList } from '@uidotdev/usehooks'
import { ChangeEventHandler, useEffect, useRef, useState } from 'react'
import UploadingFile from './UploadingFile'
import { useDisclosure } from '@mantine/hooks'
import FilterBadge from '@/components/Filters/FilterBadge'
import clsx from 'clsx'
import { XMarkIcon } from '@heroicons/react/24/outline'
import SelectFiltersModal from '@/components/SelectFiltersModal'
import useFilterValues from '@/hooks/useFilterValues'
import useSelectedFilterOrGroup from '@/hooks/useSelectedFilterOrGroup'
import useFilters from '@/hooks/useFilters'
import Categories from '@/components/Categories'
import { classnames } from '@/styles/classnames'

const BUTTON_CLASSNAME =
  'rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'

const UploadDocuments = () => {
  const [filesToUpload, { push: addFileToUpload }] = useList<File>([])

  const [
    selectedFiles,
    {
      push: addSelectedFiles,
      clear: resetSelectedFiles,
      removeAt: removeAtSelectedFile,
    },
  ] = useList<File>([])

  const handleClickFilterValueBadge = (id: string) => {
    const filter = getFilterOrGroupFromId(id)

    if (!(id in mapping)) return

    setSelectedFilterOrGroup(filter)
  }

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  const { getFilterName, getFilterOrGroupFromId, mapping, filterGroup } =
    useFilters({ categoryId: selectedCategoryId })

  const setRootAsCurrentFilterOrGroup = () => {
    setSelectedFilterOrGroup(filterGroup)
  }

  const [opened, { open, close }] = useDisclosure(false)

  const { selectedFilterOrGroup, setSelectedFilterOrGroup } =
    useSelectedFilterOrGroup(selectedCategoryId)

  const { addOrUpdateFilterValue, removeFilterValue, selectedFilterValues } =
    useFilterValues()

  const handleUploadNewFiles: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    ;[...(event.target.files ?? [])]
      .filter(({ type }) => type === 'application/pdf')
      .map(addSelectedFiles)
  }

  const selectDirectoryInput = useRef<HTMLInputElement>(null)
  const selectRegularFilesInput = useRef<HTMLInputElement>(null)

  const isYearFilterPresent = selectedFilterValues
    .map(({ filterId }) => filterId)
    .includes('year')

  const isDepotFilterPresent = selectedFilterValues
    .map(({ filterId }) => filterId)
    .includes('depot')

  const canUploadFiles =
    selectedCategoryId &&
    isYearFilterPresent &&
    isDepotFilterPresent &&
    selectedFiles.length > 0

  useEffect(() => {
    if (selectDirectoryInput.current !== null) {
      selectDirectoryInput.current.setAttribute('directory', 'true')
      selectDirectoryInput.current.setAttribute('webkitdirectory', 'true')
    }
  }, [selectDirectoryInput])

  useEffect(() => {
    if (filesToUpload.length > 0) {
      resetSelectedFiles()
    }
  }, [filesToUpload])

  useEffect(() => {
    setRootAsCurrentFilterOrGroup()
  }, [selectedCategoryId])

  return (
    <div className="flex flex-col gap-2 p-2 md:p-5">
      <h3 className="py-5 text-2xl font-bold">Upload documents</h3>

      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-row flex-wrap items-center gap-2 md:flex-nowrap">
          <div className="flex w-full items-center justify-center">
            <button
              onClick={(e) => {
                e.preventDefault()
                if (selectDirectoryInput.current) {
                  selectDirectoryInput.current.click()
                }
              }}
              type="button"
              className="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Select all PDF files from folder
            </button>

            <input
              className="hidden"
              onChange={handleUploadNewFiles}
              type="file"
              ref={selectDirectoryInput}
              multiple
              accept="application/pdf"
            />
          </div>

          <div className="flex w-full items-center justify-center">
            <button
              onClick={(e) => {
                e.preventDefault()
                if (selectRegularFilesInput.current) {
                  selectRegularFilesInput.current.click()
                }
              }}
              type="button"
              className={BUTTON_CLASSNAME}
            >
              Select file(s) individually
            </button>

            <input
              className="hidden"
              onChange={handleUploadNewFiles}
              type="file"
              multiple
              accept="application/pdf"
              ref={selectRegularFilesInput}
            />
          </div>

          <div className="flex w-full items-center justify-center">
            <button
              onClick={open}
              type="button"
              disabled={!selectedCategoryId}
              className={classnames(BUTTON_CLASSNAME, {
                'cursor-not-allowed bg-gray-500 hover:bg-gray-500':
                  !selectedCategoryId,
              })}
            >
              Select filters for files
            </button>
          </div>

          <div className="flex w-full items-center justify-center">
            <button
              onClick={() => {
                selectedFiles.map(addFileToUpload)
              }}
              disabled={!canUploadFiles}
              type="button"
              className={classnames(BUTTON_CLASSNAME, {
                'cursor-not-allowed bg-gray-500 hover:bg-gray-500':
                  !canUploadFiles,
              })}
            >
              {'Index document' + (filesToUpload.length > 1 ? 's' : '')}
            </button>
          </div>
        </div>

        <div className="my-3 w-full text-center">
          <i className="italic">
            In order to upload files, you need to specify at least their
            category and their Year and Patent repository (in Generic filters)
          </i>
        </div>

        <div className="mx-auto flex flex-row items-center gap-3 py-3">
          <p className="font-semibold text-gray-900">Category:</p>

          <Categories
            internalCategoryId={selectedCategoryId}
            setInternalCategoryId={setSelectedCategoryId}
          />
        </div>

        <SelectFiltersModal
          title="Select filters for files"
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

        <div
          className={clsx('flex w-full flex-row flex-wrap items-center gap-1', {
            hidden: selectedFilterValues.length === 0,
          })}
        >
          <p>Chosen filters:</p>

          {selectedFilterValues.map((filterValue) => (
            <FilterBadge
              removeFilterValue={() => removeFilterValue(filterValue.filterId)}
              key={filterValue.filterId}
              filterValue={filterValue}
              filterName={getFilterName(filterValue.filterId)}
              onClick={() => handleClickFilterValueBadge(filterValue.filterId)}
            />
          ))}
        </div>

        <div
          className={clsx(
            'flex max-h-28 w-full flex-row flex-wrap items-center gap-3 overflow-y-auto',
            {
              hidden: selectedFiles.length === 0,
            },
          )}
        >
          <p className="text-lg font-semibold">Selected files:</p>

          {selectedFiles.map((file: File) => (
            <p
              className="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              key={String(file)}
            >
              {file.name}
              <button
                className="pl-2"
                onClick={() =>
                  removeAtSelectedFile(
                    selectedFiles.findIndex((f) => f === file),
                  )
                }
              >
                <XMarkIcon className="h-3 w-3 stroke-black" />
              </button>
            </p>
          ))}
        </div>
      </div>

      <div className={clsx({ hidden: filesToUpload.length === 0 })}>
        <h4 className="text-lg font-semibold">Uploading files</h4>

        {filesToUpload.length > 0 ? (
          <div className="grid w-full grid-cols-2 gap-2 pt-2 sm:grid-cols-3 md:grid-cols-4">
            {filesToUpload.map((file) => (
              <UploadingFile
                file={file}
                key={file.name}
                filterValues={selectedFilterValues}
                categoryId={selectedCategoryId}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default UploadDocuments
