import { classnames } from '@/styles/classnames'

const SubmitButtonWithLoader = ({
  type = 'submit',
  onClick,
  isLoading,
  text,
  danger = false,
  className = '',
}: {
  type?: 'submit' | 'button'
  isLoading: boolean
  text: string
  danger?: boolean
  onClick?: () => void
  className?: string
}) => {
  return (
    <button
      type="submit"
      onClick={type === 'button' ? onClick : undefined}
      className={classnames(
        'flex flex-row gap-1 rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        danger
          ? 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600'
          : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600',

        isLoading ? 'cursor-not-allowed opacity-60' : '',

        className,
      )}
    >
      {isLoading ? (
        <svg
          className="-ml-1 mr-2 h-5 w-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>

          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : null}

      <p>{text}</p>
    </button>
  )
}

export default SubmitButtonWithLoader
