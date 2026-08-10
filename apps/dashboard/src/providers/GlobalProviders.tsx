import { Provider as JotaiProvider } from 'jotai'
import type { ReactNode } from 'react'
import { KeycloakProvider } from '@/providers/KeycloakProvider'

interface GlobalProvidersProps {
  children: ReactNode
}

export default function GlobalProviders({ children }: GlobalProvidersProps) {
  return (
    <JotaiProvider>
      <KeycloakProvider>{children}</KeycloakProvider>
    </JotaiProvider>
  )
}
