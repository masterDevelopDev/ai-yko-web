'use client'

import { ErrorMessage, TextField } from '@/components/Fields'
import { ApiClient } from '@/lib/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  CreateFilterDto,
  CreateFilterDtoKindEnum,
  CreateFilterDtoTypeEnum,
} from '@/lib/axios-client'
import { ALL_SEARCH_FILTERS_QUERY_KEY } from './utils'
import SubmitButtonWithLoader from '@/components/SubmitButtonWithLoader'
import { Combobox, Switch } from '@headlessui/react'
import clsx from 'clsx'
import { notifySuccess } from '@/app/settings/notify'
import {
  CheckIcon,
  ChevronUpDownIcon,
  PlusCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import useFilters from '@/hooks/useFilters'

const schema = z
  .object({
    name: z.string().min(1, { message: 'Required' }),
    type: z.nativeEnum(CreateFilterDtoTypeEnum).optional(),
    kind: z.nativeEnum(CreateFilterDtoKindEnum),
    options: z
      .object({ value: z.string().min(1) })
      .array()
      .optional(),
    categoryId: z
      .string()
      .optional()
      .transform((value) => (value === 'no-category' ? undefined : value)),
    parentId: z.string().optional(),
  })
  .refine(
    (obj) => {
      const values = obj.options?.map(({ value }) => value) ?? []
      return values.length === [...new Set(values)].length
    },
    {
      path: ['options'],
      message: 'Options should not contain duplicates',
    },
  )

// todo: refine to have the good combinations

// todo: refine to not have duplicate options

type Inputs = z.infer<typeof schema>

const createFilter = async (data: CreateFilterDto) => {
  const response = await ApiClient.filters.filtersControllerCreate(data)

  return response.data
}

const CreateFilterForm = ({
  onSuccess,
  parentId,
  categoryId,
}: {
  onSuccess: () => void
  parentId: string | null
  categoryId: string | null
}) => {
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
      kind: CreateFilterDtoKindEnum.Filter,
      categoryId: categoryId ?? 'no-category',
      parentId: parentId ?? undefined,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  })

  const [query, setQuery] = useState('')
  const [currentOptionText, setCurrentOptionText] = useState('')

  const isGroup = watch('kind') === CreateFilterDtoKindEnum.Group
  const filterType = watch('type')

  const queryClient = useQueryClient()

  const { filters } = useFilters({
    query,
    groupsOnly: true,
    categoryId: categoryId ?? '',
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateFilterDto) => createFilter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ALL_SEARCH_FILTERS_QUERY_KEY],
      })

      queryClient.invalidateQueries({
        queryKey: ['FILTERS'],
      })

      onSuccess()

      notifySuccess({
        message: 'The filter or group was created successfully',
        title: 'Filter created successfully',
      })
    },
  })

  const onSubmit: SubmitHandler<Inputs> = async ({
    name,
    kind,
    type,
    parentId,
    options,
    categoryId,
  }) => {
    mutate({
      kind,
      name,
      options: options?.map(({ value }) => value),
      parentId,
      type,
      categoryId,
    })
  }

  const handleSwitchChange = (newValue: boolean) =>
    setValue(
      'kind',
      newValue ? CreateFilterDtoKindEnum.Group : CreateFilterDtoKindEnum.Filter,
    )

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8"
    >
      <div className="flex items-center gap-2">
        <p>Create filter group</p>

        <Switch
          checked={isGroup}
          onChange={handleSwitchChange}
          className={clsx(
            isGroup ? 'bg-indigo-600' : 'bg-gray-200',
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
          )}
        >
          <span className="sr-only">Create group</span>

          <span
            aria-hidden="true"
            className={clsx(
              isGroup ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            )}
          />
        </Switch>
      </div>

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
        <div className="relative mt-2">
          <Combobox.Input
            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(selectedId) =>
              filters.find(({ id }) => id === selectedId)?.name ??
              'No group selected'
            }
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>

          {filters.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filters.map((group) => (
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
          )}
        </div>
      </Combobox>

      {isGroup ? null : (
        <>
          <div>
            <label
              htmlFor="Type"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Filter type
            </label>
            <select
              id="type"
              {...register('type')}
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              defaultValue="Canada"
            >
              {Object.values(CreateFilterDtoTypeEnum).map((value) => (
                <option key={value} value={value} className="capitalize">
                  {value.toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {filterType === CreateFilterDtoTypeEnum.MultiChoice ||
          filterType === CreateFilterDtoTypeEnum.SingleChoice ? (
            <div className="flex w-1/2 flex-col gap-1 pl-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    key={field.id}
                    {...register(`options.${index}.value`)}
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

              <ErrorMessage open={!!errors.options}>
                {errors.options?.root?.message}
              </ErrorMessage>
            </div>
          ) : null}
        </>
      )}

      <div className="col-span-full">
        <SubmitButtonWithLoader
          text={`Create ${isGroup ? 'group' : 'filter'}`}
          isLoading={isPending}
        />
      </div>
    </form>
  )
}

export default CreateFilterForm
