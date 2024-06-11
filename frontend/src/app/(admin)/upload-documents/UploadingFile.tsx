'use client'

import { ApiClient } from '@/lib/api-client'
import {
  IndexationStatusDtoStatusEnum,
  SearchQueryDtoFilterValuesInner,
} from '@/lib/axios-client'
import { formatSearchFilterValueForDocumentCreation } from '@/lib/format-search-filter-values'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { Progress } from '@mantine/core'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios, {
  AxiosProgressEvent,
  AxiosRequestTransformer,
} from 'axios'
import { MouseEventHandler, useEffect, useState } from 'react'

const getIndexationStatus = async (id: string) => {
  const response =
    await ApiClient.document.documentControllerGetIndexationStatus(id)

  return response.data
}

enum UPLOAD_STATUS {
  PENDING = 'Pending...',
  UPLOADING = 'Uploading...',
  UPLOADED = 'Uploaded',
  INDEXING = 'Indexing...',
  INDEXED = 'Indexed',
  INDEXATION_ERROR = 'Indexation error',
  CANCELLED = 'Cancelled',
  UPLOAD_ERROR = 'Error while trying to upload',
  FILE_ALREADY_EXISTS = 'File already present in database',
}

const UploadingFile = ({
  file,
  categoryId,
  filterValues,
}: {
  file: File
  categoryId: string
  filterValues: SearchQueryDtoFilterValuesInner[]
}) => {
  const [uploadStatus, setUploadStatus] = useState<{
    progress?: number
    status: UPLOAD_STATUS
  }>({
    progress: 0,
    status: UPLOAD_STATUS.PENDING,
  })

  const formattedFilterValues = filterValues.map(
    formatSearchFilterValueForDocumentCreation,
  )

  const uploadDocument = async (
    file: File,
    signal: AbortSignal,
    categoryId: string,
  ) => {
    /** This is needed to send the filters as form data properly */
    const filtersTransformer: AxiosRequestTransformer = (data: FormData) => {
      data.delete('filters')

      data.append('filters', JSON.stringify(formattedFilterValues))

      return data
    }

    const response = await ApiClient.document.documentControllerCreate(
      file,
      categoryId,
      formattedFilterValues,
      {
        transformRequest: [filtersTransformer].concat(
          axios.defaults.transformRequest ?? [],
        ),

        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const { loaded, total } = progressEvent

          if (!total) return

          const percent = Math.floor((loaded * 100) / total)

          if (percent < 100 && percent > 0) {
            setUploadStatus({
              progress: percent,
              status: UPLOAD_STATUS.UPLOADING,
            })
          }
        },
        signal,
      },
    )

    setUploadStatus({ progress: 100, status: UPLOAD_STATUS.UPLOADED })

    return response.data
  }

  const queryClient = useQueryClient()

  const QUERY_KEY = ['UPLOAD_DOCUMENT', file.name]

  const cancelUpload: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()

    queryClient.cancelQueries({ queryKey: QUERY_KEY })

    setUploadStatus({ progress: 0, status: UPLOAD_STATUS.CANCELLED })
  }

  const isUploading =
    Number.isInteger(uploadStatus.progress) &&
    uploadStatus.progress! < 100 &&
    uploadStatus.progress! > 0

  const isPending = uploadStatus.status === UPLOAD_STATUS.PENDING

  const {
    isError,
    data = { documentId: null },
    error,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async ({ signal }) => uploadDocument(file, signal, categoryId),
    enabled: uploadStatus.status != UPLOAD_STATUS.FILE_ALREADY_EXISTS,
  })

  const [shouldRefetchStatus, setShouldRefetchStatus] = useState(true)

  const { data: indexationStatus } = useQuery({
    queryFn: () => getIndexationStatus(data.documentId!),
    queryKey: ['INDEXATION_STATUS', data.documentId],
    enabled: !!data.documentId && !isError,
    refetchInterval: shouldRefetchStatus ? 1500 : undefined,
  })

  useEffect(() => {
    if (isError) {
      // @ts-ignore
      if (error.response.status === 409) {
        setUploadStatus({ status: UPLOAD_STATUS.FILE_ALREADY_EXISTS })
      } else {
        setUploadStatus({ status: UPLOAD_STATUS.UPLOAD_ERROR })
      }
      return
    }

    if (indexationStatus) {
      switch (indexationStatus.status) {
        case IndexationStatusDtoStatusEnum.Indexed:
          setUploadStatus({ status: UPLOAD_STATUS.INDEXED })
          setShouldRefetchStatus(false)
          break

        case IndexationStatusDtoStatusEnum.Error:
          setUploadStatus({ status: UPLOAD_STATUS.INDEXATION_ERROR })
          setShouldRefetchStatus(false)
          break

        case IndexationStatusDtoStatusEnum.Processing:
          setUploadStatus({ status: UPLOAD_STATUS.INDEXING })
          break

        default:
          break
      }
    }
  }, [indexationStatus, isError])

  return (
    <div className="flex flex-col gap-2 rounded-md border p-2">
      <p>{file.name}</p>

      <div className="flex h-4 w-full flex-row items-center justify-center gap-2">
        {data.documentId ||
        isError ||
        [UPLOAD_STATUS.CANCELLED, UPLOAD_STATUS.UPLOADED].includes(
          uploadStatus.status,
        ) ? null : (
          <>
            <div className="flex-grow">
              <Progress
                color={isPending ? 'gray' : 'blue'}
                value={isPending ? 100 : uploadStatus.progress!}
                striped={isPending}
                animated={isUploading || isPending}
              />
            </div>

            <button onClick={cancelUpload}>
              <XCircleIcon className="h-4 w-4 stroke-red-600" />
            </button>
          </>
        )}
      </div>

      <p>{uploadStatus.status}</p>
    </div>
  )
}

export default UploadingFile
