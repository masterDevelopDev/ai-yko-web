'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useLayoutEffect } from 'react'
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDoubleLeftIcon,
  Cog6ToothIcon,
  BookmarkSquareIcon,
  UsersIcon,
  FunnelIcon,
  DocumentTextIcon,
  DocumentArrowUpIcon,
  ArrowLeftEndOnRectangleIcon,
  HeartIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import useAuth from '@/hooks/useAuth'
import { TextLogo } from '@/components/TextLogo'
import avatarImage from '@/images/avatars/avatar.png'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import Link from 'next/link'
import useUser from '@/hooks/useUser'

export const AppShellWithAuthCheck = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const router = useRouter()

  const { isAuthenticated, isEmailValidated, isAuthStatusLoading } = useAuth()

  const pathname = usePathname()

  const isAuthenticatedPage = ![
    '/',
    '/login',
    '/register',
    '/validate-email',
    '/update-email',
    '/reset-password',
  ].includes(pathname)

  const isOperatorPage = ['/manage-documents', '/upload-documents'].includes(
    pathname,
  )

  const isAdminPage = [
    '/manage-users',
    '/manage-filters',
    'upload-junk-images',
  ].includes(pathname)

  const { user, isUserAdmin, isUserAtLeastOperator } = useUser()

  useEffect(() => {
    if (user && !isUserAtLeastOperator && isOperatorPage) {
      router.push('/')
    }

    if (user && !isUserAdmin && isAdminPage) {
      router.push('/')
    }
  }, [user])

  /** @todo Merge or move this logic to useAuth, so that it is centralized somewhere */
  useLayoutEffect(() => {
    if (isAuthenticatedPage && !isAuthStatusLoading) {
      if (isAuthenticated !== undefined && !isAuthenticated)
        router.push('/login')

      if (isEmailValidated !== undefined && !isEmailValidated)
        router.push('/validate-email')

      if (pathname === '/login' && isAuthenticated === true)
        router.push('/search')
    }
  }, [
    pathname,
    router,
    isAuthenticatedPage,
    isAuthenticated,
    isEmailValidated,
    isAuthStatusLoading,
  ])

  if (!isAuthenticated && !isAuthStatusLoading && isAuthenticatedPage) {
    return null
  }

  if (isAuthStatusLoading && !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p className="">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated && isAuthenticatedPage) {
    return null
  }

  if (!isAuthenticatedPage) {
    return <>{children}</>
  }

  return <AppShellMenu>{children}</AppShellMenu>
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const AppShellMenu = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  const isCurrent = (href: string) => pathname === href

  const { isUserAdmin, isUserAtLeastOperator } = useUser()

  const { signOut } = useAuth()

  const navigation = [
    {
      name: 'Search',
      href: '/search',
      icon: MagnifyingGlassIcon,
    },
    {
      name: 'Favorites',
      href: '/favorites',
      icon: HeartIcon,
    },
    {
      name: 'Saved Searches',
      href: '/saved-searches',
      icon: BookmarkSquareIcon,
    },
    ...(isUserAtLeastOperator
      ? [
          {
            name: 'Upload Documents',
            href: '/upload-documents',
            icon: DocumentArrowUpIcon,
          },
          {
            name: 'Manage Documents',
            href: '/manage-documents',
            icon: DocumentTextIcon,
          },
        ]
      : []),
    ...(isUserAdmin
      ? [
          {
            name: 'Manage Filters',
            href: '/manage-filters',
            icon: FunnelIcon,
          },
          {
            name: 'Manage Users',
            href: '/manage-users',
            icon: UsersIcon,
          },
          {
            name: 'Upload junk images',
            href: '/upload-junk-images',
            icon: PhotoIcon,
          },
        ]
      : []),
  ]

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-2">
                    <div className="flex h-16 shrink-0 items-center">
                      <Link href="/">
                        <TextLogo blueBackground />
                      </Link>
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className={classNames(
                                    isCurrent(item.href)
                                      ? 'bg-indigo-700 text-white'
                                      : 'text-indigo-200 hover:bg-indigo-700 hover:text-white',
                                    'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                                  )}
                                >
                                  <item.icon
                                    className={classNames(
                                      isCurrent(item.href)
                                        ? 'text-white'
                                        : 'text-indigo-200 group-hover:text-white',
                                      'h-6 w-6 shrink-0',
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li className="mt-auto flex flex-col gap-1">
                          <button
                            className="group -mx-2 flex items-center gap-x-3 rounded-md p-2 text-xs font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white"
                            onClick={signOut}
                          >
                            <ArrowLeftEndOnRectangleIcon className="h-4 w-4 shrink-0 text-indigo-200 group-hover:text-white" />
                            Sign out
                          </button>

                          <Link
                            href="/settings"
                            className="group -mx-2 mb-8 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white"
                          >
                            <Cog6ToothIcon
                              className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
                              aria-hidden="true"
                            />
                            Settings
                          </Link>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <motion.div
          animate={{ x: desktopSidebarOpen ? 0 : '-98%' }}
          initial={{ x: 0 }}
          transition={{ duration: 0.3 }}
          className={clsx(
            'relative hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col',
          )}
        >
          <div
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
            className={clsx(
              'absolute -right-7 top-20 cursor-pointer rounded-r-lg border-2 border-indigo-600 p-1',
            )}
          >
            <motion.div
              animate={{ rotate: desktopSidebarOpen ? 0 : 180 }}
              transition={{ duration: 0.4 }}
            >
              <ChevronDoubleLeftIcon
                strokeWidth={2.5}
                className={clsx('h-5 w-5')}
              />
            </motion.div>
          </div>
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6">
            <div className="flex h-16 shrink-0 items-center">
              <Link href="/">
                <TextLogo blueBackground />
              </Link>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            isCurrent(item.href)
                              ? 'bg-indigo-700 text-white'
                              : 'text-indigo-200 hover:bg-indigo-700 hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                          )}
                        >
                          <item.icon
                            className={classNames(
                              isCurrent(item.href)
                                ? 'text-white'
                                : 'text-indigo-200 group-hover:text-white',
                              'h-6 w-6 shrink-0',
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>

                <li className="mt-auto flex flex-col gap-1">
                  <button
                    className="group -mx-2 flex items-center gap-x-3 rounded-md p-2 text-xs font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white"
                    onClick={signOut}
                  >
                    <ArrowLeftEndOnRectangleIcon className="h-4 w-4 shrink-0 text-indigo-200 group-hover:text-white" />
                    Sign out
                  </button>

                  <Link
                    href="/settings"
                    className="group -mx-2 mb-8 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white"
                  >
                    <Cog6ToothIcon
                      className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
                      aria-hidden="true"
                    />
                    Settings
                  </Link>
                </li>

                {/* <li className="-mx-6 mt-auto">
                  <Profile />
                </li> */}
              </ul>
            </nav>
          </div>
        </motion.div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-indigo-600 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-indigo-200 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-white">
            {navigation.find((nav) => pathname.startsWith(nav.href))?.name ??
              'AI-YKO'}
          </div>
          <a href="#">
            <span className="sr-only">Your profile</span>
            <Image
              className="h-8 w-8 rounded-full bg-indigo-700"
              src={avatarImage}
              alt=""
              width={56}
              height={56}
            />
          </a>
        </div>

        <main
          className={clsx('mb-40 h-screen md:mb-0', {
            'lg:pl-72': desktopSidebarOpen,
          })}
        >
          <div className="h-screen px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </>
  )
}
