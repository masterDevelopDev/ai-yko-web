'use client'

import {
  FilterOrFilterGroupDto,
  FilterOrFilterGroupDtoKindEnum,
} from '@/lib/axios-client'
import FilterComponent from './FilterComponent'
import { useContext, useEffect, useState } from 'react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import AddNewChildFilter from './AddNewChildFilter'
import Modal from '@/components/Modal'
import UpdateFilterForm from './UpdateFilterForm'
import { useDisclosure } from '@mantine/hooks'
import { TextQueryContext } from '@/contexts/TextQueryContext'
import DeleteFilterButton from './DeleteFilterButton'

const FilterTree = ({
  filterOrGroup,
  initialIsOpen = false,
  nameToUse,
}: {
  filterOrGroup: FilterOrFilterGroupDto
  initialIsOpen?: boolean
  nameToUse?: string
}) => {
  const { textMatches, textMatchesOrMatchesAtLeastOneChild } =
    useContext(TextQueryContext)

  const isTextIncludedInName = textMatches(filterOrGroup.name)

  const doesTextMatchesOrMatchesAtLeastOneChild =
    textMatchesOrMatchesAtLeastOneChild(filterOrGroup)

  const [childrenOpen, setChildrenOpen] = useState<boolean>(
    initialIsOpen || !!isTextIncludedInName,
  )

  const [opened, { open, close }] = useDisclosure(false)

  useEffect(() => {
    if (doesTextMatchesOrMatchesAtLeastOneChild) {
      setChildrenOpen(true)
    }
  }, [doesTextMatchesOrMatchesAtLeastOneChild])

  if (filterOrGroup.kind === FilterOrFilterGroupDtoKindEnum.Filter) {
    return <FilterComponent filter={filterOrGroup} />
  }

  return (
    <div className="my-3 ml-2 py-2">
      <div className="flex items-center gap-2">
        <p className={clsx({ 'bg-yellow-100': isTextIncludedInName })}>
          {nameToUse ?? filterOrGroup.name} ({filterOrGroup.children?.length}{' '}
          children)
        </p>

        {filterOrGroup.id === 'root' ? null : (
          <>
            <button onClick={open}>
              <PencilSquareIcon className="h-5 w-5" />
            </button>

            <DeleteFilterButton filter={filterOrGroup} />
          </>
        )}

        {childrenOpen ? (
          <button onClick={() => setChildrenOpen(false)}>
            <ChevronDownIcon className="h-4 w-4 stroke-black" />
          </button>
        ) : (
          <button onClick={() => setChildrenOpen(true)}>
            <ChevronRightIcon className="h-4 w-4 stroke-black" />
          </button>
        )}
      </div>

      <Modal title={`Update  group`} onClose={close} opened={opened}>
        <UpdateFilterForm filter={filterOrGroup} onSuccess={close} />
      </Modal>

      <div className={clsx('ml-3', { hidden: !childrenOpen })}>
        {filterOrGroup.children?.map((fofg) => (
          <FilterTree key={fofg.id} filterOrGroup={fofg} />
        ))}

        <AddNewChildFilter
          categoryId={filterOrGroup.categoryId ?? ''}
          parentId={filterOrGroup.id === 'root' ? null : filterOrGroup.id}
        />
      </div>
    </div>
  )
}

export default FilterTree
