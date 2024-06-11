import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AppShellWithAuthCheck } from '../components/app-shell-with-auth-check'
import ReactQueryProvider from './react-query-provider'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

import '@mantine/notifications/styles.css'
import '@mantine/core/styles.css'

const DISPLAY_RQ_DEVTOOLS = false

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      <MantineProvider>
        <Notifications />

        <AppShellWithAuthCheck>{children}</AppShellWithAuthCheck>
      </MantineProvider>

      {DISPLAY_RQ_DEVTOOLS ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </ReactQueryProvider>
  )
}

export default Providers
