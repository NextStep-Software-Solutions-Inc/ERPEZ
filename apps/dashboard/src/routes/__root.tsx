import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { SonnToaster } from '@/components/ui/sonner'
import type { QueryClient } from '@tanstack/react-query'
import GlobalProviders from '@/providers/GlobalProviders'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'ERPEZ Dashboard',
      },
      {
        name: 'google',
        content: 'notranslate',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no" className="notranslate">
      <head>
        <HeadContent />
      </head>
      <body>
        <GlobalProviders>{children}</GlobalProviders>
        {/* <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        /> */}
        <SonnToaster position="bottom-right" expand />
        <Scripts />
      </body>
    </html>
  )
}
