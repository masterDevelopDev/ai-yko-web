'use client'

import { ErrorMessage, TextField } from '@/components/Fields'
import { ApiClient } from '@/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  CreateFilterDtoTypeEnum,
  FilterDto,
  FilterDtoKindEnum,
  UpdateFilterDto,
} from '@/lib/axios-client'
import { ALL_SEARCH_FILTERS_QUERY_KEY } from './utils'
import SubmitButtonWithLoader from '@/components/SubmitButtonWithLoader'
import { Combobox } from '@headlessui/react'
import clsx from 'clsx'
import { notifySuccess } from '@/app/settings/notify'
import {
  CheckIcon,
  ChevronUpDownIcon,
  LockClosedIcon,
  PlusCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import useFilters from '@/hooks/useFilters'

const updateFilter = async (id: string, data: UpdateFilterDto) => {
  const response = await ApiClient.filters.filtersControllerUpdate(id, data)

  return response.data
}

const UpdateFilterForm = ({
  onSuccess,
  filter,
}: {
  onSuccess: () => void
  filter: FilterDto
}) => {
  const schema = z
    .object({
      name: z.string().min(1, { message: 'Required' }),
      newOptions: z
        .object({
          value: z.string().min(1),
        })
        .array()
        .optional(),
      parentId: z.string().optional(),
    })
    .refine(
      (obj) => {
        const values = [
          filter.options ?? [],
          ...(obj.newOptions?.map(({ value }) => value) ?? []),
        ]
        return values.length === [...new Set(values)].length
      },
      {
        path: ['options'],
        message: 'Options should not contain duplicates',
      },
    )

  type Inputs = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setValue,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: filter.name,
      parentId: filter.parentId ?? undefined,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'newOptions',
  })

  const [query, setQuery] = useState('')

  const [currentOptionText, setCurrentOptionText] = useState('')

  const isGroup = filter.kind === FilterDtoKindEnum.Group

  const filterType = filter.type

  const filterOptions = filter.options ?? []

  const queryClient = useQueryClient()

  const { filters } = useFilters({
    query,
    categoryId: filter.categoryId,
    groupsOnly: true,
  })

  const existingFilterGroupsToDisplay = [
    ...filters.filter(({ id }) => id !== filter.id),
    {
      kind: FilterDtoKindEnum.Group,
      id: 'no-parent',
      name: 'No parent',
    },
  ]

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateFilterDto) => updateFilter(filter.id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ALL_SEARCH_FILTERS_QUERY_KEY],
      })

      onSuccess()

      notifySuccess({
        message: `The ${isGroup ? 'group' : 'filter'} was updated successfully`,
        title: 'Filter updated successfully',
      })
    },
  })

  const onSubmit: SubmitHandler<Inputs> = async ({
    name,
    parentId,
    newOptions,
  }) => {
    mutate({
      name,
      parentId,
      newOptions: newOptions?.map(({ value }) => value),
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 pb-12"
    >
      <div>
        <TextField label="Name" type="text" {...register('name')} required />

        <ErrorMessage open={!!errors.name?.message}>
          {errors.name?.message}
        </ErrorMessage>
      </div>

      <Combobox
        as="div"
        value={watch('parentId')}
        onChange={(id) => setValue('parentId', id ?? undefined)}
      >
        <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900">
          Parent group
        </Combobox.Label>

        {existingFilterGroupsToDisplay.length > 0 ? (
          <div className="relative mt-2">
            <Combobox.Input
              className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(selectedId) =>
                existingFilterGroupsToDisplay.find(
                  ({ id }) => id === selectedId,
                )?.name ?? 'No group selected'
              }
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>

            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {existingFilterGroupsToDisplay.map((group) => (
                <Combobox.Option
                  key={group.id}
                  value={group.id}
                  className={({ active }) =>
                    clsx(
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                    )
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <span
                        className={clsx(
                          'block truncate',
                          selected && 'font-semibold',
                        )}
                      >
                        {group.name}
                      </span>

                      {selected && (
                        <span
                          className={clsx(
                            'absolute inset-y-0 right-0 flex items-center pr-4',
                            active ? 'text-white' : 'text-indigo-600',
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </div>
        ) : (
          <p className="text-sm italic">
            There are no existing groups for this category
          </p>
        )}
      </Combobox>

      {isGroup ? null : (
        <>
          {filterType === CreateFilterDtoTypeEnum.MultiChoice ||
          filterType === CreateFilterDtoTypeEnum.SingleChoice ? (
            <div className="flex w-1/2 flex-col gap-1 pl-2">
              {filterOptions.map((value) => (
                <div key={value} className="flex items-center gap-2">
                  <p>{value}</p>

                  <LockClosedIcon className="h-5 w-5" />
                </div>
              ))}

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    key={field.id}
                    {...register(`newOptions.${index}.value`)}
                  />

                  <button
                    onClick={() => {
                      remove(index)
                    }}
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <input
                  value={currentOptionText}
                  onChange={(e) => setCurrentOptionText(e.target.value)}
                  placeholder="Add option..."
                />

                {currentOptionText ? (
                  <button
                    onClick={() => {
                      append({ value: currentOptionText })
                      setCurrentOptionText('')
                    }}
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                  </button>
                ) : null}
              </div>

              <ErrorMessage open={!!errors.newOptions}>
                {errors.newOptions?.root?.message}
              </ErrorMessage>
            </div>
          ) : null}
        </>
      )}

      <div className="col-span-full">
        <SubmitButtonWithLoader
          text={`Update ${isGroup ? 'group' : 'filter'}`}
          isLoading={isPending}
        />
      </div>
    </form>
  )
}

export default UpdateFilterForm
