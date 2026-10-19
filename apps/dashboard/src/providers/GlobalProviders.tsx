import { Provider as JotaiProvider } from 'jotai'
import { useEffect, type ReactNode } from 'react'
import { UnifiedAuthProvider } from '@/auth/UnifiedAuthProvider'
import { DevRoleSwitcher } from '@/components/DevRoleSwitcher'
import { initConsoleSecurityWarning } from 'erpez-shared-lib'

interface GlobalProvidersProps {
  children: ReactNode
}

// Synchronous early capture to ensure candidate tenant is in storage before router/auth evaluates
if (typeof window !== 'undefined') {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenantId');
    const tenantName = urlParams.get('tenantName');
    const tenantSlug = urlParams.get('slug') || urlParams.get('tenantSlug');
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (tenantParam && guidRegex.test(tenantParam)) {
      sessionStorage.setItem('erpez_candidate_tenant_id', tenantParam);
      localStorage.setItem('erpez_tenant_id', tenantParam);
      if (tenantName) {
        sessionStorage.setItem('erpez_tenant_name', tenantName);
        localStorage.setItem('erpez_tenant_name', tenantName);
      }
    }
    if (tenantSlug) {
      sessionStorage.setItem('erpez_tenant_slug', tenantSlug);
      localStorage.setItem('erpez_tenant_slug', tenantSlug);
    }
  } catch {
    // Ignore storage errors
  }
}

function TenantContextInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const tenantParam = urlParams.get('tenantId')
      const tenantName = urlParams.get('tenantName')
      const tenantSlug = urlParams.get('slug') || urlParams.get('tenantSlug')
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      let hasCleaned = false

      if (tenantParam && guidRegex.test(tenantParam)) {
        sessionStorage.setItem('erpez_candidate_tenant_id', tenantParam)
        localStorage.setItem('erpez_tenant_id', tenantParam)
        if (tenantName) {
          sessionStorage.setItem('erpez_tenant_name', tenantName)
          localStorage.setItem('erpez_tenant_name', tenantName)
        }
        urlParams.delete('tenantId')
        urlParams.delete('tenantName')
        hasCleaned = true
      }

      if (tenantSlug) {
        sessionStorage.setItem('erpez_tenant_slug', tenantSlug)
        localStorage.setItem('erpez_tenant_slug', tenantSlug)
        urlParams.delete('slug')
        urlParams.delete('tenantSlug')
        hasCleaned = true
      }

      if (hasCleaned) {
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
