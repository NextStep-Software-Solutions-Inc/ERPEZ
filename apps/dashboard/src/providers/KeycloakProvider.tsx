import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import type Keycloak from 'keycloak-js'
import keycloak from '@/auth/keycloak'
import { setTokenProvider, setTenantProvider, setRefreshProvider } from '@/auth/authBridge'
import { UnifiedAuthContext } from '@/auth/UnifiedAuthContext'
import type {
  UnifiedAuthContextType,
  UnifiedTenantContext,
  UnifiedUser,
  AuthState,
  TenantState,
} from '@/auth/types'

export interface DevUser {
  userId: string
  externalIdentityId: string
  displayName: string
  email: string
  roles: string[]
  tenantId: string
  isSuperAdmin: boolean
}

interface KeycloakContextType {
  keycloak: Keycloak | null
  isAuthenticated: boolean
  isInitialized: boolean
  token: string | null
  refreshToken: string | null
  userName: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  role: string | null
  roles: string[]
  tenantId: string | null
  isSuperAdmin: boolean
  activeDevUser: string
  login: () => void
  logout: () => void
  register: () => void
  updateToken: (minValidity?: number) => Promise<boolean>
  switchDevUser: (username: string) => Promise<void>
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(
  undefined,
)

interface KeycloakProviderProps {
  children: ReactNode
  /**
   * Keycloak initialization options
   */
  initOptions?: Keycloak.KeycloakInitOptions
  /**
   * Loading component to show while Keycloak is initializing
   */
  LoadingComponent?: React.ComponentType
  /**
   * Callback when initialization is complete
   */
  onInitialized?: (authenticated: boolean) => void
  /**
   * Callback when authentication fails
   */
  onAuthError?: (error: unknown) => void
}

export function KeycloakProvider({
  children,
  initOptions,
  LoadingComponent,
  onInitialized,
  onAuthError,
}: KeycloakProviderProps) {
  const isLiveKeycloak = Boolean(
    import.meta.env.VITE_KEYCLOAK_URL &&
    !import.meta.env.VITE_KEYCLOAK_URL.includes('placeholder') &&
    import.meta.env.VITE_ENABLE_DEV_PERSONAS !== 'true'
  )

  const [isInitialized, setIsInitialized] = useState(!isLiveKeycloak)
  const [isAuthenticated, setIsAuthenticated] = useState(!isLiveKeycloak)
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('erpez_auth_token')
        if (stored && stored.startsWith('ey')) {
          if (keycloak) {
            ;(keycloak as any).token = stored
            ;(keycloak as any).authenticated = true
          }
          return stored
        }
      } catch {
        // Ignore
      }
    }
    return null
  })
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(isLiveKeycloak ? null : 'dev_planner')
  const [email, setEmail] = useState<string | null>(isLiveKeycloak ? null : 'dev_planner@erpez.dev')
  const [firstName, setFirstName] = useState<string | null>(isLiveKeycloak ? null : 'Planning Officer')
  const [lastName, setLastName] = useState<string | null>('')
  const [roles, setRoles] = useState<string[]>(isLiveKeycloak ? [] : ['Planning Officer'])
  const [tenantId, setTenantId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('erpez_candidate_tenant_id') || localStorage.getItem('erpez_tenant_id') || null
      } catch {
        return null
      }
    }
    return null
  })
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [activeDevUser, setActiveDevUser] = useState<string>('dev_planner')

  // Unified multi-tenant abstraction state
  const [activeTenant, setActiveTenant] = useState<UnifiedTenantContext | null>(null)
  const [availableTenants, setAvailableTenants] = useState<UnifiedTenantContext[]>([])
  const [tenantState, setTenantState] = useState<TenantState>('loading')

  const backendUrl = import.meta.env.VITE_ERPEZ_BACKEND_URL || 'http://localhost:5245'

  // Register token & candidate tenant provider with unified auth bridge
  useEffect(() => {
    setTokenProvider(async () => token)
    setTenantProvider(() => activeTenant?.id || tenantId || null)
    setRefreshProvider((minValidity) => updateToken(minValidity))
  }, [token, activeTenant?.id, tenantId])

  const fetchTenantContext = useCallback(async (candidateId?: string | null) => {
    if (!token) return
    try {
      setTenantState('loading')
      const targetId = candidateId || tenantId
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
      if (targetId) {
        headers['X-Tenant-Id'] = targetId
      }

      // 1. Fetch available workspaces authorized for this identity
      const availRes = await fetch(`${backendUrl}/api/tenant/available`, { headers })
      if (availRes.ok) {
        const json = await availRes.json()
        const avail: UnifiedTenantContext[] = json?.data || []
        setAvailableTenants(avail)
      }

      // 2. Fetch active workspace context
      const ctxRes = await fetch(`${backendUrl}/api/tenant/context`, { headers })
      if (ctxRes.ok) {
        const json = await ctxRes.json()
        const data = json?.data
        if (data?.activeTenant) {
          setActiveTenant({
            id: data.activeTenant.id,
            externalOrgId: data.activeTenant.externalOrgId,
            name: data.activeTenant.name,
            slug: data.activeTenant.slug,
            authProvider: 'keycloak',
          })
          setTenantState('resolved')
        } else {
          setActiveTenant(null)
          setTenantState('unavailable')
        }
      } else if (ctxRes.status === 403) {
        setTenantState('forbidden')
      } else {
        setTenantState('unavailable')
      }
    } catch {
      setTenantState('unavailable')
    }
  }, [token, tenantId, backendUrl])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchTenantContext()
    }
  }, [isAuthenticated, token, fetchTenantContext])

  const switchTenant = useCallback(
    async (newTenantId: string) => {
      setTenantId(newTenantId)
      try {
        sessionStorage.setItem('erpez_candidate_tenant_id', newTenantId)
        localStorage.setItem('erpez_tenant_id', newTenantId)
      } catch {}
      await fetchTenantContext(newTenantId)
    },
    [fetchTenantContext]
  )

  const loginAsDevUser = useCallback(async (username: string) => {
    if (typeof window === 'undefined') return false

    const candidateTenant = sessionStorage.getItem('erpez_candidate_tenant_id')
      || localStorage.getItem('erpez_tenant_id')
      || '00000000-0000-0000-0000-000000000001'

    try {
      const response = await fetch(`${backendUrl}/auth/dev/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          tenantId: candidateTenant,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const json = await response.json()
      const authData = json?.data
      if (authData?.token) {
        const jwtToken = authData.token
        const user = authData.user

        setToken(jwtToken)
        setIsAuthenticated(true)
        setUserName(user.userId)
        setEmail(user.email)
        setFirstName(user.displayName)
        setLastName('')
        setRoles(user.roles || [])
        setTenantId(user.tenantId || candidateTenant)
        setIsSuperAdmin(Boolean(user.isSuperAdmin))
        setActiveDevUser(user.userId)

        // Store in localStorage & sync keycloak instance
        try {
          localStorage.setItem('erpez_dev_user', user.userId)
          localStorage.setItem('erpez_auth_token', jwtToken)
          localStorage.setItem('erpez_tenant_id', user.tenantId || candidateTenant)
        } catch {
          // Ignore storage errors
        }

        if (keycloak) {
          ;(keycloak as any).token = jwtToken
          ;(keycloak as any).authenticated = true
        }
        return true
      }
    } catch (error) {
      console.warn('Dev login error:', error)
      try {
        const stored = localStorage.getItem('erpez_auth_token')
        if (stored && !stored.startsWith('ey')) {
          localStorage.removeItem('erpez_auth_token')
        }
      } catch {
        // Ignore
      }
    }
    return false
  }, [backendUrl])

  const initializedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || initializedRef.current) return
    initializedRef.current = true

    if (isLiveKeycloak) {
      // Live Keycloak OIDC Authentication flow
      const initLive = async () => {
        try {
          const authenticated = await keycloak.init({
            onLoad: 'login-required',
            checkLoginIframe: false,
            pkceMethod: 'S256',
            ...initOptions,
          })

          setIsAuthenticated(authenticated)
          if (authenticated && keycloak.token) {
            setToken(keycloak.token)
            setRefreshToken(keycloak.refreshToken || null)
            try {
              localStorage.setItem('erpez_auth_token', keycloak.token)
              if (keycloak.refreshToken) {
                localStorage.setItem('erpez_refresh_token', keycloak.refreshToken)
              }
            } catch {}

            const parsed = keycloak.tokenParsed as any
            const sub = parsed?.sub || ''
            const userEmail = parsed?.email || ''
            const givenName = parsed?.given_name || parsed?.name || 'User'
            const familyName = parsed?.family_name || ''
            const realmRoles = parsed?.realm_access?.roles || []

            setUserName(parsed?.preferred_username || userEmail || sub)
            setEmail(userEmail)
            setFirstName(givenName)
            setLastName(familyName)
            setRoles(realmRoles.length > 0 ? realmRoles : ['Tenant Administrator'])
            setIsSuperAdmin(realmRoles.includes('platform_administrator') || realmRoles.includes('SuperAdmin'))
          }

          keycloak.onTokenExpired = () => {
            keycloak.updateToken(30).then((refreshed) => {
              if (refreshed && keycloak.token) {
                setToken(keycloak.token)
                setRefreshToken(keycloak.refreshToken || null)
                try {
                  localStorage.setItem('erpez_auth_token', keycloak.token)
                  if (keycloak.refreshToken) {
                    localStorage.setItem('erpez_refresh_token', keycloak.refreshToken)
                  }
                } catch {}
              }
            }).catch((err) => {
              console.error('Failed to refresh Keycloak token:', err)
              onAuthError?.(err)
            })
          }

          keycloak.onAuthLogout = () => {
            setIsAuthenticated(false)
            setToken(null)
            setRefreshToken(null)
            try {
              localStorage.removeItem('erpez_auth_token')
              localStorage.removeItem('erpez_refresh_token')
            } catch {}
          }

          setIsInitialized(true)
          onInitialized?.(authenticated)
        } catch (err) {
          console.error('Keycloak initialization error:', err)
          setIsAuthenticated(false)
          setIsInitialized(true)
          onAuthError?.(err)
        }
      }

      initLive()
      return
    }

    // Dev persona fallback flow
    const initDev = async () => {
      let savedUser = 'dev_planner'
      try {
        savedUser = localStorage.getItem('erpez_dev_user') || 'dev_planner'
      } catch {
        // Fallback
      }

      const stored = localStorage.getItem('erpez_auth_token')
      if (!stored || !stored.startsWith('ey')) {
        await loginAsDevUser(savedUser)
      }
      setIsInitialized(true)
      if (onInitialized) onInitialized(true)
    }

    initDev()
  }, [isLiveKeycloak, loginAsDevUser, onInitialized, onAuthError, initOptions])

  const switchDevUser = async (username: string) => {
    if (!isLiveKeycloak) {
      await loginAsDevUser(username)
    }
  }

  const login = () => {
    if (isLiveKeycloak && keycloak) {
      keycloak.login?.()
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('erpez_auth_token')
      localStorage.removeItem('erpez_refresh_token')
    } catch {}
    if (isLiveKeycloak && keycloak) {
      keycloak.logout?.()
    } else {
      setIsAuthenticated(false)
    }
  }

  const register = () => {
    if (isLiveKeycloak && keycloak) {
      keycloak.register?.()
    }
  }

  const updateToken = async (minValidity = 5): Promise<boolean> => {
    if (isLiveKeycloak && keycloak) {
      try {
        const refreshed = await keycloak.updateToken(minValidity)
        if (refreshed && keycloak.token) {
          setToken(keycloak.token)
          setRefreshToken(keycloak.refreshToken || null)
          try {
            localStorage.setItem('erpez_auth_token', keycloak.token)
            if (keycloak.refreshToken) {
              localStorage.setItem('erpez_refresh_token', keycloak.refreshToken)
            }
          } catch {}
        }
        return refreshed
      } catch (err) {
        console.error('Failed to update Keycloak token', err)
        return false
      }
    }
    return true
  }

  if (!isInitialized) {
    if (LoadingComponent) {
      return <LoadingComponent />
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-lg">Initializing authentication...</p>
        </div>
      </div>
    )
  }

  const authState: AuthState = !isInitialized ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated'
  const unifiedUser: UnifiedUser | null = isAuthenticated
    ? {
        id: userName || '',
        username: userName || '',
        email: email || '',
        displayName: `${firstName || ''} ${lastName || ''}`.trim() || userName || 'User',
        roles,
      }
    : null

  const unifiedValue: UnifiedAuthContextType = {
    authState,
    tenantState,
    authReady: authState === 'authenticated',
    tenantContextReady: tenantState === 'resolved',
    user: unifiedUser,
    workspaceMembers: [],
    workspaceInvitations: [],
    inviteWorkspaceMember: async () => {
      throw new Error('Workspace member invitation is only available in SaaS / Clerk mode.');
    },
    revokeWorkspaceInvitation: async () => {},
    activeTenant,
    availableTenants,
    switchTenant,
    getToken: async () => token,
    logout: async () => {
      logout()
    },
    provider: 'keycloak',

    isAuthenticated,
    isInitialized,
    token,
    refreshToken,
    userName,
    email,
    firstName,
    lastName,
    role: roles[0] || null,
    roles,
    tenantId: activeTenant?.id || tenantId,
    isSuperAdmin,
    activeDevUser,
    login,
    register,
    updateToken,
    switchDevUser,
  }

  return (
    <KeycloakContext.Provider
      value={{
        keycloak,
        isAuthenticated,
        isInitialized,
        token,
        refreshToken,
        userName,
        email,
        firstName,
        lastName,
        role: roles[0] || null,
        roles,
        tenantId: activeTenant?.id || tenantId,
        isSuperAdmin,
        activeDevUser,
        login,
        logout,
        register,
        updateToken,
        switchDevUser,
      }}
    >
      <UnifiedAuthContext.Provider value={unifiedValue}>
        {children}
      </UnifiedAuthContext.Provider>
    </KeycloakContext.Provider>
  )
}

export function useKeycloak() {
  const context = useContext(KeycloakContext)
  const unified = useContext(UnifiedAuthContext)

  if (context !== undefined) {
    return context
  }

  if (unified !== undefined) {
    return {
      keycloak: null,
      ...unified,
    } as unknown as KeycloakContextType
  }

  throw new Error('useKeycloak must be used within a KeycloakProvider or UnifiedAuthProvider')
}
