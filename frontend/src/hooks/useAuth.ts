import { ApiClient } from '@/lib/api-client'
import { getCookie, removeTokens } from '@/lib/cookies'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const IS_AUTHENTICATED_KEY = 'authentication/is-authenticated'

const getAuthenticationStatus = async () => {
  const response =
    await ApiClient.auth.authenticationControllerCheckIfAuthenticated()

  return response.data
}

const signOutApiCall = async () => {
  const accessToken = getCookie('accessToken')
  const refreshToken = getCookie('refreshToken')

  if (!(accessToken && refreshToken))
    throw new Error('Access tokens not found in cookies')

  const response = await ApiClient.auth.authenticationControllerSignOut({
    accessToken,
    refreshToken,
  })

  return response.data
}

const useAuth = () => {
  const { data, isLoading: isAuthStatusLoading } = useQuery({
    queryKey: [IS_AUTHENTICATED_KEY],
    queryFn: getAuthenticationStatus,
  })

  const queryClient = useQueryClient()

  const router = useRouter()

  const pathname = usePathname()

  const { mutate: signOut } = useMutation({
    mutationFn: () => signOutApiCall(),
    onSuccess: () => {
      removeTokens()

      queryClient.invalidateQueries({
        queryKey: [IS_AUTHENTICATED_KEY],
      })
    },
  })

  useEffect(() => {
    if (
      pathname !== '/' &&
      !pathname.startsWith('/login') &&
      data?.isAuthenticated === false
    )
      router.push('/login')
  }, [data?.isAuthenticated])

  return {
    ...data,
    isAuthStatusLoading,
    signOut: () => signOut(),
  }
}

export default useAuth
