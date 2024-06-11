import Link from 'next/link'
import { SlimLayout } from '@/components/SlimLayout'
import { type Metadata } from 'next'
import LoginForm from './LoginForm'
import {TextLogo} from "@/components/TextLogo";

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function Login() {
  return (
    <SlimLayout>
      <div className="flex">
        <Link href="/" aria-label="Home">
            <TextLogo />
        </Link>
      </div>
      <h2 className="mt-20 text-lg font-semibold text-gray-900">
        Sign in to your account
      </h2>
      <p className="mt-2 text-sm text-gray-700">
        Don’t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:underline"
        >
          Sign up
        </Link>{' '}
        for a free trial.
      </p>

      <LoginForm />
    </SlimLayout>
  )
}
