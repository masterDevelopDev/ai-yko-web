import { XMarkIcon } from '@heroicons/react/24/outline'
import { Modal as MantineModal, ModalProps } from '@mantine/core'

type Props = ModalProps & {
  opened: boolean
  onClose: () => void
  children?: React.ReactNode
  title?: string
}

const Modal = ({ children, opened, onClose, title, ...otherProps }: Props) => (
  <MantineModal.Root
    onClose={onClose}
    opened={opened}
    styles={{
      content: {
        borderRadius: '1rem',
      },
    }}
    {...otherProps}
  >
    <MantineModal.Overlay />
    <MantineModal.Content>
      <MantineModal.Header>
        <MantineModal.Title>
          <p className="pl-3 text-xl font-bold">{title}</p>
        </MantineModal.Title>

        <button
          onClick={onClose}
          type="button"
          className="absolute right-3 top-3 z-10 rounded-full bg-gray-300 p-1 text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
        >
          <XMarkIcon className="h-8 w-8 md:h-5 md:w-5" aria-hidden="true" />
        </button>
      </MantineModal.Header>
      <MantineModal.Body>{children}</MantineModal.Body>
    </MantineModal.Content>
  </MantineModal.Root>
)

export default Modal
