import { Provider as JotaiProvider } from 'jotai'
import type { ReactNode } from 'react'
import { KeycloakProvider } from '@/providers/KeycloakProvider'
import { DevRoleSwitcher } from '@/components/DevRoleSwitcher'

interface GlobalProvidersProps {
  children: ReactNode
}

export default function GlobalProviders({ children }: GlobalProvidersProps) {
  return (
    <JotaiProvider>
      <KeycloakProvider>
        {children}
        <DevRoleSwitcher />
      </KeycloakProvider>
    </JotaiProvider>
  )
}
