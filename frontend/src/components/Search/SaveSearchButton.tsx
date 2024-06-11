'use client'

import { SearchContext } from '@/contexts/SearchContext'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useContext } from 'react'

const SaveSearchButton = () => {
  const { isSavedSearch, saveSearch } = useContext(SearchContext)

  return (
    <button
      onClick={() => saveSearch()}
      className={clsx(
        'flex items-center gap-1 rounded-xl p-3 font-medium hover:bg-gray-300',
        { hidden: false },
      )}
    >
      <p className="hidden md:block">
        {isSavedSearch ? 'Search saved' : 'Save search'}
      </p>

      <BookmarkIcon
        title="Save search"
        className={clsx(
          'h-8 w-8 hover:scale-110',
          isSavedSearch ? 'fill-black' : '',
        )}
      />
    </button>
  )
}

export default SaveSearchButton
