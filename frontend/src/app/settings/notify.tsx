import { notifications } from '@mantine/notifications'

export const notifySuccess = ({
  title,
  message,
  autoClose = true,
}: {
  title: string
  message: string
  autoClose?: boolean
}) => {
  notifications.show({
    color: 'white',
    title,
    message,
    classNames: {
      icon: 'hidden',
      root: 'bg-white',
    },
    autoClose,
  })
}
