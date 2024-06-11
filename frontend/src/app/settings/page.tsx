'use client'

import { ApiClient } from '@/lib/api-client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { notifySuccess } from './notify'
import { ErrorMessage, TextField } from '@/components/Fields'
import { passwordSchema } from '@/lib/password-schema'
import SubmitButtonWithLoader from '@/components/SubmitButtonWithLoader'
import useUser, { USER_PROFILE_KEY } from '@/hooks/useUser'

const checkIfEmailIsAlreadyRegistered = async (
  email: string,
): Promise<boolean> => {
  try {
    const response =
      await ApiClient.auth.authenticationControllerCheckIfEmailRegistered(email)

    return response.data.isEmailAlreadyRegistered
  } catch {
    /** @todo there should be a clear error telling we could not do the checking */
    /** @todo when we update the email in the backend from profile settings, check that the new email is not taken already */
    return true
  }
}

const SettingsPage = () => {
  const { user } = useUser()

  const schema = z
    .object({
      firstName: z.string().min(1, { message: 'Required' }),
      lastName: z.string().min(1, { message: 'Required' }),
      email: z.string().email({ message: 'You should enter a valid email' }),
      /** stolen from https://stackoverflow.com/a/74546728 */
      currentPassword: z
        .string()
        .min(1, { message: 'Please enter current password' })
        .optional()
        .or(z.literal('')),
      newPassword: passwordSchema.optional().or(z.literal('')),
      confirmNewPassword: z.string().optional(),
    })
    .refine(
      (obj) => {
        if (obj.newPassword) {
          if (obj.currentPassword) {
            return true
          } else {
            return false
          }
        }

        return true
      },
      {
        message: 'Current password must be provided to update to new password',
        path: ['currentPassword'],
      },
    )
    .refine(
      (obj) => {
        if (obj.newPassword) {
          return obj.currentPassword !== obj.newPassword
        }

        return true
      },
      {
        message: 'New password must be different from current password',
        path: ['newPassword'],
      },
    )
    .refine((obj) => obj.newPassword === obj.confirmNewPassword, {
      message: 'Confirmation password does not match password',
      path: ['confirmNewPassword'],
    })
    .refine(
      async (obj) => {
        if (obj.email === user?.email) {
          return true
        }

        const isEmailAlreadyRegistered = await checkIfEmailIsAlreadyRegistered(
          obj.email,
        )

        return !isEmailAlreadyRegistered
      },
      {
        message: 'This email address is already registered to another user',
        path: ['email'],
      },
    )

  type Inputs = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: user,
  })

  const queryClient = useQueryClient()

  const updateProfileData = async ({
    firstName,
    lastName,
    newPassword,
    currentPassword,
    email,
  }: Omit<Inputs, 'confirmNewPassword'>) => {
    const response = await ApiClient.user.userControllerUpdateProfile({
      firstName,
      lastName,
      email,
      currentPassword,
      /** if newPasword is empty string, should be undefined instead */
      newPassword: newPassword === '' ? undefined : newPassword,
    })

    return response.data
  }

  const { mutate: updateData, isPending } = useMutation({
    mutationFn: updateProfileData,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [USER_PROFILE_KEY],
      })

      notifySuccess({
        title: 'Profile updated successfully',
        message: `Your personal profile was updated.${
          data.hasVerificationEmailBeenSent
            ? ' Please click the link sent to your email to finalize email update.'
            : ''
        }`,
        autoClose: !data.hasVerificationEmailBeenSent,
      })
    },
    onError: ({ response }: any) => {
      notifySuccess({
        title: 'Error while trying to update your info',
        message:
          response?.data?.frontendMessage ??
          'We could not update your profile information. Please retry later.',
      })
    },
  })

  const onSubmit: SubmitHandler<Inputs> = async ({
    firstName,
    lastName,
    newPassword,
    currentPassword,
    email,
  }) => {
    updateData({
      firstName,
      lastName,
      newPassword,
      currentPassword,
      email,
    })
  }

  useEffect(() => {
    reset(user)
  }, [reset, user])

  return (
    <form className="pt-10" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-12 pl-4">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            You can update your details on this page
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <div className="mt-2">
                <div>
                  <TextField
                    label="First name"
                    type="text"
                    autoComplete="given-name"
                    required
                    {...register('firstName')}
                  />

                  <ErrorMessage open={!!errors.firstName?.message}>
                    {errors.firstName?.message}
                  </ErrorMessage>
                </div>
              </div>
            </div>

            <div className="sm:col-span-3">
              <div className="mt-2">
                <TextField
                  label="Last name"
                  type="text"
                  autoComplete="family-name"
                  {...register('lastName')}
                  required
                />

                <ErrorMessage open={!!errors.lastName?.message}>
                  {errors.lastName?.message}
                </ErrorMessage>
              </div>
            </div>

            <div className="sm:col-span-4">
              <div className="mt-2">
                <TextField
                  className="col-span-full"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  required
                />

                <ErrorMessage open={!!errors.email?.message}>
                  {errors.email?.message}
                </ErrorMessage>
              </div>
            </div>

            <h2 className="text-sm font-semibold leading-7 text-gray-900 sm:col-span-6">
              Update your password
            </h2>

            <div className="sm:col-span-4">
              <div className="mt-2">
                <TextField
                  label="Current Password"
                  type="password"
                  autoComplete="new-password"
                  {...register('currentPassword')}
                />

                <ErrorMessage open={!!errors.currentPassword?.message}>
                  {errors.currentPassword?.message}
                </ErrorMessage>

                <TextField
                  className="mt-3"
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  {...register('newPassword')}
                />

                <ErrorMessage open={!!errors.newPassword?.message}>
                  {errors.newPassword?.message}
                </ErrorMessage>

                <TextField
                  className="mt-3"
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmNewPassword')}
                />
                <ErrorMessage open={!!errors.confirmNewPassword?.message}>
                  {errors.confirmNewPassword?.message}
                </ErrorMessage>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <SubmitButtonWithLoader text="Save" isLoading={isPending} />
      </div>

      <p className="pt-32 text-sm italic text-gray-500">Version: 0.1.0</p>
    </form>
  )
}

export default SettingsPage
