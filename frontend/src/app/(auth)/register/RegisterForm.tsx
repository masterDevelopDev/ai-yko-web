'use client'

import { Button } from '@/components/Button'
import { ErrorMessage, TextField } from '@/components/Fields'
import { IS_AUTHENTICATED_KEY } from '@/hooks/useAuth'
import { ApiClient } from '@/lib/api-client'
import { saveTokens } from '@/lib/cookies'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { passwordSchema } from '@/lib/password-schema'

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

const schema = z
  .object({
    firstName: z.string().min(1, { message: 'Required' }),
    lastName: z.string().min(1),
    email: z.string().email({ message: 'You should enter a valid email' }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((obj) => obj.password === obj.confirmPassword, {
    message: 'Confirmation password does not match password',
    path: ['confirmPassword'],
  })
  .refine(
    async (obj) => {
      const isEmailAlreadyRegistered = await checkIfEmailIsAlreadyRegistered(
        obj.email,
      )

      return !isEmailAlreadyRegistered
    },
    {
      message: 'This email address is already registered',
      path: ['email'],
    },
  )

type Inputs = z.infer<typeof schema>

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  })

  const router = useRouter()

  const queryClient = useQueryClient()

  const requestSignup = async (data: Omit<Inputs, 'confirmPassword'>) => {
    const response = await ApiClient.auth.authenticationControllerSignUp(data)

    return response.data
  }

  const { mutate: signup } = useMutation({
    mutationFn: requestSignup,
    onSuccess: (data) => {
      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })

      queryClient.invalidateQueries({
        queryKey: [IS_AUTHENTICATED_KEY],
      })

      router.push('/validate-email')
    },
  })

  const onSubmit: SubmitHandler<Inputs> = async ({
    firstName,
    lastName,
    password,
    email,
  }) => {
    signup({
      firstName,
      lastName,
      password,
      email,
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2"
    >
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

      <div>
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

      <div>
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
        <Button type="submit" variant="solid" color="blue" className="w-full">
          <span>
            Sign up <span aria-hidden="true">&rarr;</span>
          </span>
        </Button>
      </div>
    </form>
  )
}

export default RegisterPage
