'use client'

import { SearchContext } from '@/contexts/SearchContext'
import { ListBulletIcon, PhotoIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useContext } from 'react'

export default function SearchResultsModeSwitch() {
  const { resultsDisplayMode, setResultsDisplayMode, isSearchQueryFinished } =
    useContext(SearchContext)

  return (
    <div
      className={clsx('flex items-center justify-end gap-3 pt-1', {
        hidden: !isSearchQueryFinished,
      })}
    >
      <button
        onClick={() => setResultsDisplayMode('list')}
        className={clsx('rounded-md p-1', {
          'bg-gray-200': resultsDisplayMode === 'list',
        })}
      >
        <ListBulletIcon className="h-8 w-8" />
      </button>

      <button
        onClick={() => setResultsDisplayMode('carousel')}
        className={clsx('rounded-md p-1', {
          'bg-gray-200': resultsDisplayMode === 'carousel',
        })}
      >
        <PhotoIcon className="h-8 w-8" />
      </button>
    </div>
  )
}
