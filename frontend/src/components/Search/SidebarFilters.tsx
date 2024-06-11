'use client'

import { Fragment, useContext, useState } from 'react'
import { Dialog, Disclosure, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/20/solid'
import getFilterOrFilterGroupComponent from '../../components/Filters/getFilterOrFilterGroupComponent'
import clsx from 'clsx'
import { SearchContext } from '@/contexts/SearchContext'

const SidebarFilters = ({ children }: { children: React.ReactNode }) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const {
    refinementFilters,
    setSelectedFilterOrGroup,
    addOrUpdateFilterValue,
    removeFilterValue,
    selectedFilterValues,
    getFilterName,
    isSearchPending,
  } = useContext(SearchContext)

  if (!refinementFilters || refinementFilters.length === 0 || isSearchPending) {
    return <>{children}</>
  }

  return (
    <div className="bg-white">
      <div>
        <Transition.Root show={mobileFiltersOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 lg:hidden"
            onClose={setMobileFiltersOpen}
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
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Filters
                    </h2>
                    <button
                      type="button"
                      className="-mr-2 flex h-10 w-10 items-center justify-center p-2 text-gray-400 hover:text-gray-500"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      <span className="sr-only">Close menu</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <form className="mt-4">
                    {refinementFilters.map(({ filter, counts }) => (
                      <Disclosure
                        as="div"
                        key={filter.id}
                        className="border-t border-gray-200 pb-4 pt-4"
                      >
                        {({ open }) => (
                          <fieldset>
                            <legend className="w-full px-2">
                              <Disclosure.Button className="flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500">
                                <span className="text-sm font-medium text-gray-900">
                                  {getFilterName(filter.id, true)}
                                </span>
                                <span className="ml-6 flex h-7 items-center">
                                  <ChevronDownIcon
                                    className={clsx(
                                      open ? '-rotate-180' : 'rotate-0',
                                      'h-5 w-5 transform',
                                    )}
                                    aria-hidden="true"
                                  />
                                </span>
                              </Disclosure.Button>
                            </legend>
                            <Disclosure.Panel className="px-4 pb-2 pt-4">
                              <div className="space-y-6">
                                {getFilterOrFilterGroupComponent(
                                  {
                                    selectedFilterOrGroup: filter,
                                    addOrUpdateFilterValue,
                                    isSearchMode: true,
                                    removeFilterValue,
                                    selectedFilterValues,
                                    counts,
                                  },
                                  setSelectedFilterOrGroup,
                                )}
                              </div>
                            </Disclosure.Panel>
                          </fieldset>
                        )}
                      </Disclosure>
                    ))}
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        <div>
          <div className="pt-2 lg:grid lg:grid-cols-4 lg:gap-x-3 xl:grid-cols-5">
            <aside>
              <h2 className="sr-only">Filters</h2>

              <button
                type="button"
                className="inline-flex items-center lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <span className="text-sm font-medium text-gray-700">
                  Refine search
                </span>

                <PlusIcon
                  className="ml-1 h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
              </button>

              <div className="hidden max-h-[80vh] overflow-y-auto lg:block">
                <form className="space-y-10 divide-y divide-gray-200 p-1">
                  {refinementFilters.map(({ filter, counts }, sectionIdx) => (
                    <div
                      key={filter.id}
                      className={sectionIdx === 0 ? undefined : 'pt-10'}
                    >
                      <legend className="mb-3 block text-sm font-medium text-gray-900">
                        {getFilterName(filter.id, true)}
                      </legend>

                      {getFilterOrFilterGroupComponent(
                        {
                          selectedFilterOrGroup: filter,
                          addOrUpdateFilterValue,
                          isSearchMode: true,
                          removeFilterValue,
                          selectedFilterValues,
                          counts,
                        },
                        setSelectedFilterOrGroup,
                      )}
                    </div>
                  ))}
                </form>
              </div>
            </aside>

            <div className="mt-6 max-h-[50vh] overflow-y-auto sm:max-h-[80vh] lg:col-span-3 lg:mt-0 xl:col-span-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SidebarFilters
