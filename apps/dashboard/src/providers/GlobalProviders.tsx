import { Provider as JotaiProvider } from 'jotai'
import { useEffect, type ReactNode } from 'react'
import { UnifiedAuthProvider } from '@/auth/UnifiedAuthProvider'
import { DevRoleSwitcher } from '@/components/DevRoleSwitcher'
import { initConsoleSecurityWarning } from 'erpez-shared-lib'

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
  useEffect(() => {
    initConsoleSecurityWarning()
  }, [])

  const isDevPersonasAllowed =
    import.meta.env.VITE_ENABLE_DEV_PERSONAS === 'true' &&
    (import.meta.env.VITE_AUTH_PROVIDER || '').toLowerCase() !== 'clerk'

  return (
    <JotaiProvider>
      <TenantContextInitializer />
      <UnifiedAuthProvider>
        {children}
        {isDevPersonasAllowed && <DevRoleSwitcher />}
      </UnifiedAuthProvider>
    </JotaiProvider>
  )
}
