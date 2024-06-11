'use client'

import Link from 'next/link'
import { SlimLayout } from '@/components/SlimLayout'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiClient } from '@/lib/api-client'
import { TextLogo } from '@/components/TextLogo'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ErrorMessage, TextField } from '@/components/Fields'
import { Button } from '@/components/Button'
import { IS_AUTHENTICATED_KEY } from '@/hooks/useAuth'
import { saveTokens } from '@/lib/cookies'
import clsx from 'clsx'
import { passwordSchema } from '@/lib/password-schema'
import { useSearchParams } from 'next/navigation'

const passwordResetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((obj) => obj.password === obj.confirmPassword, {
    message: 'Confirmation password does not match password',
    path: ['confirmPassword'],
  })

type PasswordInputs = z.infer<typeof passwordResetSchema>

const emailSchema = z.object({
  email: z.string().email(),
})

type EmailInputs = z.infer<typeof emailSchema>

const askForPasswordResetFunction = async (email: string) => {
  const response =
    await ApiClient.auth.authenticationControllerAskResetPassword({ email })

  return response.data
}

const resetPasswordFunction = async ({
  password,
  token,
}: {
  password: string
  token: string
}) => {
  const response = await ApiClient.auth.authenticationControllerResetPassword({
    password,
    token,
  })

  return response.data
}

const CLASSNAMES =
  'inline-block rounded-lg -ml-2 mt-2 px-2 py-1 text-sm text-slate-600 text-center'

export default function ResetPasswordPage() {
  const queryClient = useQueryClient()

  const params = useSearchParams()

  const token = params.get('token')

  const {
    mutate: askForPasswordReset,
    isSuccess: isAskForPasswordResetSuccess,
  } = useMutation({
    mutationFn: askForPasswordResetFunction,
  })

  const { mutate: resetPassword, isSuccess } = useMutation({
    mutationFn: resetPasswordFunction,
    onSuccess: (data) => {
      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })

      queryClient.invalidateQueries({
        queryKey: [IS_AUTHENTICATED_KEY],
      })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordInputs>({
    resolver: zodResolver(passwordResetSchema),
  })

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
  } = useForm<EmailInputs>({
    resolver: zodResolver(emailSchema),
  })

  const onSubmitEmail = ({ email }: EmailInputs) => {
    askForPasswordReset(email)
  }

  const onSubmitPassword = ({ password }: PasswordInputs) => {
    if (typeof token !== 'string') return

    resetPassword({
      password,
      token,
    })
  }

  return (
    <SlimLayout>
      <div className="flex h-full flex-col justify-between">
        <div className="flex">
          <Link href="/" aria-label="Home">
            <TextLogo />
          </Link>
        </div>

        {typeof token !== 'string' ? (
          <>
            {isAskForPasswordResetSuccess ? (
              <p className={CLASSNAMES}>
                If your email is registered, you will receive an email to reset
                your password.
              </p>
            ) : (
              <form
                onSubmit={handleSubmitEmail(onSubmitEmail)}
                className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8"
              >
                <p className={clsx(CLASSNAMES, 'text-start')}>
                  Please enter your email, we&apos;ll use it to send you a
                  password reset link.
                </p>

                <div>
                  <TextField
                    {...registerEmail('email')}
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    required
                  />

                  <ErrorMessage open={!!errorsEmail.email?.message}>
                    {errorsEmail.email?.message}
                  </ErrorMessage>
                </div>

                <div className="col-span-full">
                  <Button
                    type="submit"
                    variant="solid"
                    color="blue"
                    className="w-full"
                  >
                    <span>
                      Reset password <span aria-hidden="true">&rarr;</span>
                    </span>
                  </Button>
                </div>
              </form>
            )}
          </>
        ) : (
          <>
            {isSuccess ? (
              <p className={CLASSNAMES}>
                Your password was reset successfully. <br />
                <Link className="underline" href="/search">
                  Go to search
                </Link>
                .
              </p>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmitPassword)}
                className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8"
              >
                <p className={clsx(CLASSNAMES, 'text-start')}>
                  Please enter your new password:
                </p>

                <div>
                  <TextField
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    {...register('password')}
                    required
                  />

                  <ErrorMessage open={!!errors.password?.message}>
                    {errors.password?.message}
                  </ErrorMessage>

                  <TextField
                    className="mt-3"
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    required
                  />
                  <ErrorMessage open={!!errors.confirmPassword?.message}>
                    {errors.confirmPassword?.message}
                  </ErrorMessage>
                </div>

                <div className="col-span-full">
                  <Button
                    type="submit"
                    variant="solid"
                    color="blue"
                    className="w-full"
                  >
                    <span>
                      Save new password <span aria-hidden="true">&rarr;</span>
                    </span>
                  </Button>
                </div>
              </form>
            )}
          </>
        )}

        <div></div>
      </div>
    </SlimLayout>
  )
}
