'use client'

import useCategories from '@/hooks/useCategories'
import { FilterOrFilterGroupDto } from '@/lib/axios-client'
import { classnames } from '@/styles/classnames'

interface Props {
  categoryIdToShow?: string
  internalCategoryId: string
  setInternalCategoryId?: (s: string) => void
  withGenericCategory?: boolean
  hideOtherCategories?: boolean
  setSelectedFilterOrGroup?: (f: FilterOrFilterGroupDto) => void
}

const Categories = ({
  internalCategoryId,
  setInternalCategoryId,

  categoryIdToShow,

  withGenericCategory = false,

}: Props) => {
  const { categories } = useCategories({ withGenericCategory })


  const handleClickCategoryId = (cid: string) => {
    if (!setInternalCategoryId) return

    setInternalCategoryId(cid)
  }

  const categoriesToDisplay = categoryIdToShow
    ? categories.filter((c) => c.id === categoryIdToShow || c.id === 'generic')
    : categories


  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      {categoriesToDisplay.map((category) => (
        <div
          onClick={() => handleClickCategoryId(category.id)}
          className={classnames(
            'inline-flex cursor-pointer items-center rounded-md bg-gray-50 p-1 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10',
            {
              'bg-gray-900 text-white': internalCategoryId === category.id,
            },
          )}
          key={category.id}
        >
          {category.name}
        </div>
      ))}
    </div>
  )
}

export default Categories
