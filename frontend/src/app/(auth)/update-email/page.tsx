'use client'

import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { SlimLayout } from '@/components/SlimLayout'
import { useQuery } from '@tanstack/react-query'
import { ApiClient } from '@/lib/api-client'

export default function CheckUpdatedEmail({
  searchParams,
}: {
  searchParams: {
    token?: string
  }
}) {
  const checkEmailUpdateToken = async () => {
    const response =
      await ApiClient.auth.authenticationControllerConfirmProfileEmailUpdate(
        searchParams.token ?? '',
      )

    return response.data
  }

  const { isError, data } = useQuery({
    queryFn: checkEmailUpdateToken,
    queryKey: ['CHECK_UPDATE_EMAIL_TOKEN'],
  })

  if (!searchParams.token) {
    return <SlimLayout>The verification link must include the token</SlimLayout>
  }

  return (
    <SlimLayout>
      <div className="flex">
        <Link href="/" aria-label="Home">
          <Logo className="h-10 w-auto" />
        </Link>
      </div>
      {data?.success ? (
        <>
          <h2 className="mt-20 text-lg font-semibold text-gray-900">
            Email validated
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Your email has been updated. You can close this window.
          </p>
        </>
      ) : (
        <h2 className="mt-20 text-lg font-semibold text-gray-900">
          {isError ? 'Invalid token' : 'Verifying update token...'}
        </h2>
      )}
    </SlimLayout>
  )
}
