'use client'

import Modal from '@/components/Modal'
import {
  FilterDto,
  FilterDtoKindEnum,
  FilterDtoTypeEnum,
} from '@/lib/axios-client'
import { useDisclosure } from '@mantine/hooks'
import UpdateFilterForm from './UpdateFilterForm'
import {
  ChevronUpDownIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useContext, useEffect } from 'react'
import { TextQueryContext } from '@/contexts/TextQueryContext'
import { classnames } from '@/styles/classnames'
import DeleteFilterButton from './DeleteFilterButton'

const FILTER_TYPE_TO_TW_CLASS: Record<FilterDtoTypeEnum, string> = {
  [FilterDtoTypeEnum.Date]: 'bg-green-100 text-green-700',
  [FilterDtoTypeEnum.Year]: 'bg-blue-100 text-blue-700',
  [FilterDtoTypeEnum.Integer]: 'bg-yellow-100 text-yellow-700',
  [FilterDtoTypeEnum.MultiChoice]: 'bg-indigo-100 text-indigo-700',
  [FilterDtoTypeEnum.SingleChoice]: 'bg-purple-100 text-purple-700',
  [FilterDtoTypeEnum.Text]: 'bg-pink-100 text-pink-700',
}

const FilterComponent = ({ filter }: { filter: FilterDto }) => {
  const [opened, { open, close }] = useDisclosure(false)

  const { text, textMatches } = useContext(TextQueryContext)

  const [
    choiceFilterOptionsVisible,
    { open: showChoiceFilterOptions, close: hideChoiceFilterOptions },
  ] = useDisclosure(false)

  const textsToLookInto = [filter.name, ...(filter.options ?? [])]

  const isTextIncluded = textsToLookInto.some(textMatches)

  const isChoiceFilter =
    filter.type === FilterDtoTypeEnum.MultiChoice ||
    filter.type === FilterDtoTypeEnum.SingleChoice

  useEffect(() => {
    if (isTextIncluded && isChoiceFilter) {
      showChoiceFilterOptions()
    }
  }, [isTextIncluded])

  return (
    <div className="my-3 flex w-fit flex-row flex-wrap items-center justify-start gap-2 rounded-md p-2">
      <p
        className={clsx(
          {
            'bg-yellow-100': isTextIncluded,
          },
          'leading-3',
        )}
      >
        {filter.name}
      </p>

      <span
        className={clsx(
          'inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium capitalize',
          filter.type ? FILTER_TYPE_TO_TW_CLASS[filter.type] : undefined,
        )}
      >
        {filter.type?.toLowerCase() ?? 'Filter type not recognized'}
      </span>

      <button onClick={open}>
        <PencilSquareIcon className="h-5 w-5" />
      </button>

      <DeleteFilterButton filter={filter} />

      {isChoiceFilter ? (
        <>
          <button
            onClick={
              choiceFilterOptionsVisible
                ? hideChoiceFilterOptions
                : showChoiceFilterOptions
            }
          >
            <ChevronUpDownIcon className="h-5 w-5 rotate-90 stroke-black" />
          </button>
          {choiceFilterOptionsVisible ? (
            <>
              <br />

              {filter
                .options!.filter((option) => text === '' || textMatches(option))
                .map((option) => (
                  <span
                    className={classnames(
                      'inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200',
                      {
                        'bg-yellow-100': textMatches(option),
                      },
                    )}
                    key={option}
                  >
                    {option}
                  </span>
                ))}
            </>
          ) : null}
        </>
      ) : null}

      <Modal
        title={`Update ${filter.kind === FilterDtoKindEnum.Group ? 'group' : `${filter.type?.toLowerCase()} filter`}`}
        onClose={close}
        opened={opened}
      >
        <UpdateFilterForm filter={filter} onSuccess={close} />
      </Modal>
    </div>
  )
}

export default FilterComponent
