import { ErrorMessage, TextField } from '@/components/Fields'
import { Switch } from '@headlessui/react'
import clsx from 'clsx'
import SubmitButtonWithLoader from '@/components/SubmitButtonWithLoader'
import { SavedSearchDtoMonitoringFrequencyEnum } from '@/lib/axios-client'

const UpdateSavedSearchForm = ({
  onSubmit,
  isUpdatingSavedSearch,
  errors,
  register,
  isMonitoredFormValue,
  setValue,
  watch,
}: any) => {
  return (
    <form className="flex flex-col gap-2 p-3" onSubmit={onSubmit}>
      <label
        title="Search name"
        className="text-base font-semibold text-gray-900"
      >
        Name
      </label>

      <div>
        <TextField label="" type="text" {...register('name')} required />

        <ErrorMessage open={!!errors.name?.message}>
          {errors.name?.message}
        </ErrorMessage>
      </div>

      <label
        title="Activate search monitoring?"
        className="text-base font-semibold text-gray-900"
      >
        Monitor search
      </label>

      <div className="py-1">
        <Switch
          checked={isMonitoredFormValue}
          onChange={(value) => {
            setValue('isMonitored', value)
          }}
          className={clsx(
            isMonitoredFormValue ? 'bg-indigo-600' : 'bg-gray-200',
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
          )}
        >
          <span className="sr-only">Use setting</span>
          <span
            className={clsx(
              isMonitoredFormValue ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            )}
          >
            <span
              className={clsx(
                isMonitoredFormValue
                  ? 'opacity-0 duration-100 ease-out'
                  : 'opacity-100 duration-200 ease-in',
                'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity',
              )}
              aria-hidden="true"
            >
              <svg
                className="h-3 w-3 text-gray-400"
                fill="none"
                viewBox="0 0 12 12"
              >
                <path
                  d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span
              className={clsx(
                isMonitoredFormValue
                  ? 'opacity-100 duration-200 ease-in'
                  : 'opacity-0 duration-100 ease-out',
                'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity',
              )}
              aria-hidden="true"
            >
              <svg
                className="h-3 w-3 text-indigo-600"
                fill="currentColor"
                viewBox="0 0 12 12"
              >
                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
              </svg>
            </span>
          </span>
        </Switch>
      </div>

      {isMonitoredFormValue ? (
        <>
          <label
            title="How frequently do you prefer to receive emails about this search?"
            className="text-base font-semibold text-gray-900"
          >
            Monitoring frequency
          </label>

          <fieldset className="mt-4">
            <legend className="sr-only">Monitoring frequency</legend>
            <div className="space-y-4">
              {Object.values(SavedSearchDtoMonitoringFrequencyEnum).map(
                (freq) => (
                  <div key={freq} className="flex items-center">
                    <input
                      onChange={(e) => {
                        if (e.target.checked)
                          setValue('monitoringFrequency', freq)
                      }}
                      checked={watch('monitoringFrequency') === freq}
                      id={freq}
                      name="monitoring-frequency"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor={freq}
                      className="ml-3 block text-sm font-medium capitalize leading-6 text-gray-900"
                    >
                      {freq.toLowerCase()}
                    </label>
                  </div>
                ),
              )}
            </div>
          </fieldset>
        </>
      ) : null}

      <div className="self-end">
        <SubmitButtonWithLoader text="Save" isLoading={isUpdatingSavedSearch} />
      </div>
    </form>
  )
}

export default UpdateSavedSearchForm
