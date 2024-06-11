'use client'

import { Button } from '@/components/Button'
import { ErrorMessage, TextField } from '@/components/Fields'
import { ApiClient } from '@/lib/api-client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'
import { saveTokens } from '@/lib/cookies'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth, { IS_AUTHENTICATED_KEY } from '@/hooks/useAuth'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string(),
})

type Inputs = z.infer<typeof schema>

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  })

  const { isAuthenticated } = useAuth()

  const signin = async (data: Inputs) => {
    const response = await ApiClient.auth.authenticationControllerSignIn(data)

    return response.data
  }

  const { mutate: login } = useMutation({
    mutationFn: signin,
    onSuccess: (data) => {
      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })

      queryClient.invalidateQueries({
        queryKey: [IS_AUTHENTICATED_KEY],
      })
    },
    onError: () => {
      setError('password', {
        message: 'Login failed. Please use valid credentials.',
      })
    },
  })

  const queryClient = useQueryClient()

  const router = useRouter()

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    login(data)
  }

  useEffect(() => {
    if (isAuthenticated === true) router.push('/search')
  }, [isAuthenticated])

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-10 grid grid-cols-1 gap-y-8"
    >
      <TextField
        label="Email address"
        type="email"
        autoComplete="email"
        {...register('email')}
        required
      />

      <ErrorMessage open={!!errors.email?.message}>
        {errors.email?.message}
      </ErrorMessage>

      <TextField
        label="Password"
        {...register('password')}
        type="password"
        autoComplete="current-password"
        required
      />

      {/* 
      The error for the password is used for the errors that come from the API
      */}

      <ErrorMessage open={!!errors.password?.message}>
        {errors.password?.message}
      </ErrorMessage>

      <div>
        <Button type="submit" variant="solid" color="blue" className="w-full">
          <span>
            Sign in <span aria-hidden="true">&rarr;</span>
          </span>
        </Button>
      </div>

      <Link
        href="/reset-password"
        className="-mt-3  w-full text-center text-sm text-gray-500 underline"
      >
        Forgotten password?
      </Link>
    </form>
  )
}

export default LoginForm
