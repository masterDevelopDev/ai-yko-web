'use client'

import useAuth from '@/hooks/useAuth'

const SignInOrOut = () => {
  const { isAuthenticated, isAuthStatusLoading, signOut } = useAuth()

  if (isAuthStatusLoading) return null

  return (
    <span onClick={() => signOut()}>
      {isAuthenticated ? 'Sign out' : 'Sign in'}
    </span>
  )
}

export default SignInOrOut
