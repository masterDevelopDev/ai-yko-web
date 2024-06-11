'use client'

import { notifySuccess } from '@/app/settings/notify'
import { TrashIcon } from '@heroicons/react/24/outline'
import { useDisclosure } from '@mantine/hooks'
import { ALL_SEARCH_FILTERS_QUERY_KEY } from './utils'
import SubmitButtonWithLoader from '@/components/SubmitButtonWithLoader'
import Modal from '@/components/Modal'
import { ApiClient } from '@/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FilterOrFilterGroupDto,
  FilterOrFilterGroupDtoKindEnum,
} from '@/lib/axios-client'

const deleteFilter = async (id: string) => {
  const response = await ApiClient.filters.filtersControllerRemove(id)

  return response.data
}

const DeleteFilterButton = ({ filter }: { filter: FilterOrFilterGroupDto }) => {
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false)

  const queryClient = useQueryClient()

  const { mutate: mutateDelete, isPending } = useMutation({
    mutationFn: () => deleteFilter(filter.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ALL_SEARCH_FILTERS_QUERY_KEY],
      })

      queryClient.invalidateQueries({
        queryKey: ['FILTERS'],
      })

      closeDeleteModal()

      notifySuccess({
        title: 'Filter deleted successfully',
        message: `The filter ${filter.name} was deleted sucessfully`,
      })
    },
  })

  return (
    <>
      <button onClick={openDeleteModal}>
        <TrashIcon className="h-5 w-5 stroke-red-500" />
      </button>

      <Modal
        title={`Delete filter ${
          filter.kind === FilterOrFilterGroupDtoKindEnum.Group ? 'group' : ''
        }`}
        onClose={closeDeleteModal}
        opened={deleteModalOpened}
      >
        <div className="flex flex-col gap-3 p-3">
          <p>
            Are you sure you want to delete filter
            {filter.kind === FilterOrFilterGroupDtoKindEnum.Group
              ? ' group '
              : ' '}
            <span className="font-bold italic">{filter.name}</span>?
          </p>

          {filter.kind === FilterOrFilterGroupDtoKindEnum.Group ? (
            <p className="text-sm italic text-gray-500">
              The children of this group will then go up on top of the filters
              hierarchy.
            </p>
          ) : null}

          <div className="self-end">
            <SubmitButtonWithLoader
              text="Yes, delete"
              danger
              isLoading={isPending}
              type="button"
              onClick={mutateDelete}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}

export default DeleteFilterButton
