'use client'

import { useState } from 'react'
import SavedSearch from './SavedSearch'
import useSavedSearches from './useSavedSearches'
import clsx from 'clsx'
import { Switch } from '@headlessui/react'

const SavedSearchesPage = () => {
  const { savedSearches, savedSearchesLoading } = useSavedSearches()

  const [showMonitoredSearchesOnly, setShowMonitoredSearchesOnly] =
    useState(false)

  const searchesToShow = showMonitoredSearchesOnly
    ? savedSearches.filter((ss) => ss.isMonitored)
    : savedSearches

  return (
    <div className="p-4 md:p-12">
      <div className="flex w-full flex-col gap-2 md:flex-row md:justify-between">
        <h1 className="text-2xl font-semibold">Saved searches</h1>

        <div className="flex flex-row items-center gap-2">
          <p>Show monitored searches only</p>

          <Switch
            checked={showMonitoredSearchesOnly}
            onChange={setShowMonitoredSearchesOnly}
            className={clsx(
              showMonitoredSearchesOnly ? 'bg-indigo-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
            )}
          >
            <span className="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              className={clsx(
                showMonitoredSearchesOnly ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              )}
            />
          </Switch>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {searchesToShow.length === 0 ? (
          <p>
            {savedSearchesLoading
              ? 'Loading...'
              : `You do not have any ${
                  showMonitoredSearchesOnly ? 'monitored ' : ''
                }saved searches`}
          </p>
        ) : (
          searchesToShow.map((ss) => <SavedSearch key={ss.id} data={ss} />)
        )}
      </div>
    </div>
  )
}

export default SavedSearchesPage
