import { Provider as JotaiProvider } from 'jotai'
import { useEffect, type ReactNode } from 'react'
import { KeycloakProvider } from '@/providers/KeycloakProvider'
import { DevRoleSwitcher } from '@/components/DevRoleSwitcher'
import { initConsoleSecurityWarning } from 'erpez-shared-lib'

interface GlobalProvidersProps {
  children: ReactNode
}

export default function GlobalProviders({ children }: GlobalProvidersProps) {
  useEffect(() => {
    initConsoleSecurityWarning()
  }, [])

  return (
    <JotaiProvider>
      <KeycloakProvider>
        {children}
        {!import.meta.env.PROD && <DevRoleSwitcher />}
      </KeycloakProvider>
    </JotaiProvider>
  )
}
