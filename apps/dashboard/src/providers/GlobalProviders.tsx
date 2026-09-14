import { Provider as JotaiProvider } from 'jotai'
import { useEffect, type ReactNode } from 'react'
import { KeycloakProvider } from '@/providers/KeycloakProvider'
import { DevRoleSwitcher } from '@/components/DevRoleSwitcher'

interface GlobalProvidersProps {
  children: ReactNode
}

function TenantContextInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const tenantParam = urlParams.get('tenantId')
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      if (tenantParam && guidRegex.test(tenantParam)) {
        // Store candidate tenant in sessionStorage (session continuity) and localStorage
        sessionStorage.setItem('erpez_candidate_tenant_id', tenantParam)
        localStorage.setItem('erpez_tenant_id', tenantParam)

        // Cleanly scrub tenantId param from browser URL
        urlParams.delete('tenantId')
        const remainingQuery = urlParams.toString()
        const newUrl = window.location.pathname + (remainingQuery ? `?${remainingQuery}` : '') + window.location.hash
        window.history.replaceState({}, document.title, newUrl)
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  return null
}

export default function GlobalProviders({ children }: GlobalProvidersProps) {
  return (
    <JotaiProvider>
      <TenantContextInitializer />
      <KeycloakProvider>
        {children}
        <DevRoleSwitcher />
      </KeycloakProvider>
    </JotaiProvider>
  )
}
