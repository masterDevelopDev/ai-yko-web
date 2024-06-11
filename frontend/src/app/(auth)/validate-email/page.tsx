'use client'

import Link from 'next/link'
import { SlimLayout } from '@/components/SlimLayout'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiClient } from '@/lib/api-client'
import clsx from 'clsx'
import { TextLogo } from '@/components/TextLogo'
import { useLayoutEffect } from 'react'
import { IS_AUTHENTICATED_KEY } from '@/hooks/useAuth'
import { useSearchParams } from 'next/navigation'

const resendVerificationEmail = async () => {
  const response =
    await ApiClient.auth.authenticationControllerResendValidationEmail()

  return response.data
}

const sendEmailVerificationToken = async (token: string) => {
  const response =
    await ApiClient.auth.authenticationControllerValidateEmail(token)

  return response.data
}

const CLASSNAMES =
  'inline-block rounded-lg -ml-2 mt-2 px-2 py-1 text-sm text-slate-600'

export default function ValidateEmail() {
  const { mutate: resendEmail, isSuccess: hasVerificationEmailBeenResent } =
    useMutation({
      mutationFn: resendVerificationEmail,
    })

  const params = useSearchParams()

  const token = params.get('token')

  const queryClient = useQueryClient()

  const {
    mutate: sendVerificationToken,
    isSuccess,
    isPending: isTokenVerificationPending,
    isError,
  } = useMutation({
    mutationFn: sendEmailVerificationToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [IS_AUTHENTICATED_KEY] })
    },
  })

  useLayoutEffect(() => {
    if (typeof token !== 'string' || isTokenVerificationPending) return

    sendVerificationToken(token)
  }, [])

  return (
    <SlimLayout>
      <div className="flex">
        <Link href="/" aria-label="Home">
          <TextLogo />
        </Link>
      </div>

      {typeof token === 'string' ? (
        <>
          {isSuccess ? (
            <>
              <h2 className="mt-20 text-lg font-semibold text-gray-900">
                Email validated
              </h2>
              <p className="mt-2 text-sm text-gray-700">
                Your email has been validated. You can close this window or go
                to the{' '}
                <Link className="underline" href="/search">
                  search page
                </Link>
                .
              </p>
            </>
          ) : null}

          {isTokenVerificationPending ? (
            <>
              <p className="mt-20 text-sm text-gray-700">
                Validating your email...
              </p>
            </>
          ) : null}

          {isError ? (
            <>
              <h2 className="mt-20 text-lg font-semibold text-gray-900">
                Email validation failed
              </h2>
              <p className="mt-2 text-sm text-gray-700">
                Sorry, but the link your provided is invalid.
              </p>
            </>
          ) : null}
        </>
      ) : (
        <>
          <h2 className="mt-20 text-lg font-semibold text-gray-900">
            Email validation
          </h2>

          <p className="mt-2 text-sm text-gray-700">
            Please click the validation link we sent you by email.
          </p>

          {hasVerificationEmailBeenResent ? (
            <p className={CLASSNAMES}>
              The verification link was sent to your email.
            </p>
          ) : (
            <button
              onClick={() => resendEmail()}
              className={clsx(
                CLASSNAMES,
                'hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              Resend verification email
            </button>
          )}
        </>
      )}
    </SlimLayout>
  )
}
