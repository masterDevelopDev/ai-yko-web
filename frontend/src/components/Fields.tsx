import clsx from 'clsx'
import { ForwardedRef, forwardRef, useId } from 'react'

const formClasses =
  'block w-full appearance-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-blue-500 sm:text-sm'

function Label({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={id}
      className="mb-3 block text-sm font-medium text-gray-700"
    >
      {children}
    </label>
  )
}

export const TextField = forwardRef(
  (
    {
      label,
      type = 'text',
      className,
      ...props
    }: Omit<React.ComponentPropsWithoutRef<'input'>, 'id'> & { label: string },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    let id = useId()

    return (
      <div className={className}>
        {label && <Label id={id}>{label}</Label>}
        <input
          ref={ref}
          id={id}
          type={type}
          {...props}
          className={formClasses}
        />
      </div>
    )
  },
)

TextField.displayName = 'TextField'

export function SelectField({
  label,
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'select'>, 'id'> & { label: string }) {
  let id = useId()

  return (
    <div className={className}>
      {label && <Label id={id}>{label}</Label>}
      <select id={id} {...props} className={clsx(formClasses, 'pr-8')} />
    </div>
  )
}

export const ErrorMessage = ({
  children,
  open,
}: {
  children: React.ReactNode
  open: boolean
}) => {
  return (
    <div
      className={clsx(
        'mt-1 grid grid-rows-[0fr] text-sm text-red-500 transition-all duration-1000',
        {
          'grid-rows-[1fr]': open,
        },
      )}
    >
      <div className="overflow-hidden">
        <p>{children}</p>
      </div>
    </div>
  )
}
