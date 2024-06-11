'use client'

import { notifySuccess } from '@/app/settings/notify'
import Modal from '@/components/Modal'
import SubmitButtonWithLoader from '@/components/SubmitButtonWithLoader'
import { ApiClient } from '@/lib/api-client'
import {
  UserProfileDto,
  UserProfileDtoRoleEnum,
  UserProfileDtoStatusEnum,
} from '@/lib/axios-client'
import { classnames } from '@/styles/classnames'
import { PencilIcon } from '@heroicons/react/24/outline'
import { useDisclosure } from '@mantine/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

const updateUserRole = async (
  userId: string,
  {
    newRole,
    newStatus,
  }: { newRole: UserProfileDtoRoleEnum; newStatus: UserProfileDtoStatusEnum },
) => {
  const response = await ApiClient.admin.adminControllerUpdateUserPermissions(
    userId,
    { newRole, newStatus },
  )

  return response.data
}

const UserComponent = ({ user }: { user: UserProfileDto }) => {
  const [opened, { open, close }] = useDisclosure(false)

  const queryClient = useQueryClient()

  const [newRole, setNewRole] = useState<UserProfileDtoRoleEnum>(user.role)

  const [newStatus, setNewStatus] = useState<UserProfileDtoStatusEnum>(
    user.status,
  )

  const { isPending, mutate } = useMutation({
    mutationFn: async () => updateUserRole(user.id, { newRole, newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ALL_USERS_EXCEPT_ME'],
      })

      close()

      notifySuccess({
        title: 'Role updated successfully',
        message: `You successfully updated ${user.email}'s role and status`,
      })
    },
  })

  return (
    <div
      key={user.email}
      className="group mx-auto flex w-full max-w-3xl flex-row flex-wrap justify-between rounded-md p-4 hover:bg-slate-200"
    >
      <Modal title="Update user" opened={opened} onClose={close}>
        <div className="ml-auto flex flex-col gap-3">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Select new role for user
          </h3>

          <div>
            <select
              id="new-role"
              name="new-role"
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={newRole}
              onChange={(e) =>
                setNewRole(e.target.value as UserProfileDtoRoleEnum)
              }
            >
              {Object.values(UserProfileDtoRoleEnum).map((role) => (
                <option
                  className="capitalize"
                  key={role}
                  value={role}
                  disabled={role === user.role}
                >
                  {role.toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Select new status for user
          </h3>

          <div>
            <select
              id="new-status"
              name="new-status"
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={newStatus}
              onChange={(e) =>
                setNewStatus(e.target.value as UserProfileDtoStatusEnum)
              }
            >
              {Object.values(UserProfileDtoStatusEnum).map((status) => (
                <option
                  className="capitalize"
                  key={status}
                  value={status}
                  disabled={status === user.status}
                >
                  {status.toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="self-end">
            <SubmitButtonWithLoader
              isLoading={isPending}
              text="Update role"
              danger
              type="button"
              onClick={mutate}
            />
          </div>
        </div>
      </Modal>

      <div className="flex flex-col flex-wrap gap-2 sm:flex-row">
        <span className={classnames('truncate group-hover:font-semibold')}>
          {user.firstName} {user.lastName}
        </span>

        <span
          className={classnames(
            'truncate text-gray-500 group-hover:text-indigo-500',
          )}
        >
          {user.email}
        </span>

        <span
          className={classnames(
            'inline-flex w-fit items-center  rounded-md px-2 py-1 text-xs font-medium capitalize',
            {
              'bg-gray-100 text-gray-600':
                user.role === UserProfileDtoRoleEnum.User,
              'bg-yellow-100 text-yellow-800':
                user.role === UserProfileDtoRoleEnum.Operator,
              'bg-red-100 text-red-700':
                user.role === UserProfileDtoRoleEnum.Admin,
            },
          )}
        >
          {user.role.toLowerCase()}
        </span>

        <span
          className={classnames(
            'inline-flex w-fit items-center rounded-lg px-2 py-1 text-xs font-medium',
            {
              'bg-green-200 text-green-600':
                user.status === UserProfileDtoStatusEnum.Active,
              'bg-red-400 text-red-800':
                user.status === UserProfileDtoStatusEnum.Deactivated,
            },
          )}
        >
          {user.status.toLowerCase()}
        </span>
      </div>

      <div>
        <button onClick={open}>
          <PencilIcon className="h-5 w-5 stroke-black" />
        </button>
      </div>
    </div>
  )
}

export default UserComponent
