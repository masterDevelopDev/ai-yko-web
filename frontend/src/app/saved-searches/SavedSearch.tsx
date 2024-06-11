'use client'

import Link from 'next/link'
import useSavedSearch from './useSavedSearch'
import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useDisclosure } from '@mantine/hooks'
import Modal from '@/components/Modal'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import UpdateSavedSearchForm from './UpdateSavedSearchForm'
import SubmitButtonWithLoader from '@/components/SubmitButtonWithLoader'
import { notifySuccess } from '../settings/notify'
import { useQueryClient } from '@tanstack/react-query'
import { SAVED_SEARCHES_QUERY_KEY } from './utils'
import {
  SavedSearchDto,
  UpdateSavedSearchDtoMonitoringFrequencyEnum,
} from '@/lib/axios-client'
import FilterBadge from '@/components/Filters/FilterBadge'
import useFilters from '@/hooks/useFilters'
import SearchImage from '@/components/Search/SearchImage'
import useCategories from '@/hooks/useCategories'

const schema = z
  .object({
    name: z.string().min(1, { message: 'Required' }),
    isMonitored: z.boolean(),
    monitoringFrequency: z.any().optional(), // z.nativeEnum(SavedSearchResultMonitoringFrequencyEnum).optional(),
  })
  .refine(
    (obj) => {
      if (obj.isMonitored) {
        return !!obj.monitoringFrequency
      }

      return true
    },
    {
      message: 'Frequency must be set when monitoring is enabled',
      path: ['monitoringFrequency'],
    },
  )

type Inputs = z.infer<typeof schema>

const SavedSearch = ({ data }: { data: SavedSearchDto }) => {
  const {
    isUpdatingSavedSearch,
    isDeletingSavedSearch,
    mutateSavedSearchRemove,
    mutateSavedSearchUpdate,
  } = useSavedSearch(data.id)

  const { name, id, isMonitored, monitoringFrequency } = data

  const { getFilterName } = useFilters()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: { name, isMonitored, monitoringFrequency },
  })

  const isMonitoredFormValue = watch('isMonitored')

  const [opened, { open, close }] = useDisclosure(false)

  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false)

  const queryClient = useQueryClient()

  const onSubmit: SubmitHandler<Inputs> = async ({
    isMonitored,
    name,
    monitoringFrequency,
  }) => {
    mutateSavedSearchUpdate(
      {
        isMonitored,
        name,
        monitoringFrequency: isMonitored
          ? (monitoringFrequency as UpdateSavedSearchDtoMonitoringFrequencyEnum)
          : undefined,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: SAVED_SEARCHES_QUERY_KEY })

          close()

          notifySuccess({
            message: 'Your saved search was updated successfully',
            title: 'Saved search updated',
          })
        },
      },
    )
  }

  const { getCategoryName } = useCategories()

  const categoryName = getCategoryName(data.categoryId ?? '')

  const deleteSavedSearch = () => {
    mutateSavedSearchRemove(data.id, {
      onSuccess: () => {
        closeDeleteModal()

        notifySuccess({
          message: 'Your saved search was deleted safely',
          title: 'Saved search deleted',
        })
      },
    })
  }

  return (
    <div className={'grid w-full grid-cols-3 rounded-md border sm:flex-row'}>
      <div className="flex-1 p-5">
        <p className="text-lg font-semibold">{name}</p>

        <p>
          {isMonitored
            ? `Monitored ${monitoringFrequency?.toLowerCase()}`
            : 'Not monitored'}
        </p>
      </div>

      <div className="flex flex-row flex-wrap items-center gap-2 pt-2">
        {data.categoryId !== 'generic' && data.categoryId ? (
          <span className="inline-flex items-center rounded-md bg-gray-900 px-2 py-0.5 text-white">
            {categoryName}
          </span>
        ) : null}

        {data.filterValues.map((fv) => (
          <FilterBadge
            key={fv.filterId}
            filterName={getFilterName(fv.filterId)}
            filterValue={fv}
          />
        ))}

        {data.images.length === 0
          ? null
          : data.images
              .slice(0, 4)
              .map((image) => (
                <SearchImage key={image.id.toString()} url={image.url} />
              ))}

        {data.text && <p className="italic text-gray-500">Text: {data.text}</p>}
      </div>

      <div className="flex flex-1 justify-end p-2">
        <div className="flex min-h-8 flex-row-reverse items-end justify-between gap-3 md:flex-col">
          <div className="flex gap-3">
            <button onClick={open}>
              <PencilSquareIcon className="h-7 w-7" />
            </button>

            <Link target="_blank" href={`/search?saved_search_id=${id}`}>
              <ArrowTopRightOnSquareIcon className="h-7 w-7 stroke-gray-600" />
            </Link>

            <Modal title="Edit saved search" opened={opened} onClose={close}>
              <UpdateSavedSearchForm
                setValue={setValue}
                register={register}
                errors={errors}
                onSubmit={handleSubmit(onSubmit)}
                isUpdatingSavedSearch={isUpdatingSavedSearch}
                isMonitoredFormValue={isMonitoredFormValue}
                watch={watch}
              />
            </Modal>
          </div>

          <button onClick={openDeleteModal}>
            <TrashIcon className="h-7 w-7 stroke-red-500" />
          </button>

          <Modal
            title="Delete saved search?"
            opened={deleteModalOpened}
            onClose={closeDeleteModal}
          >
            <div className="ml-auto flex flex-col items-end gap-3">
              <p className="mt-5 self-start">
                Are you sure you want to delete search{' '}
                <span className="font-bold">{name}</span>?
              </p>

              <SubmitButtonWithLoader
                isLoading={isDeletingSavedSearch}
                text="Yes, delete"
                danger
                type="button"
                onClick={deleteSavedSearch}
              />
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}

export default SavedSearch
