'use client'

import useAuth from '@/hooks/useAuth'
import { Button } from './Button'

const GetStartedButton = () => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return null

  return (
    <Button href="/register" color="blue">
      <span>
        Get started <span className="hidden lg:inline">today</span>
      </span>
    </Button>
  )
}

export default GetStartedButton
