import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import type Keycloak from 'keycloak-js'
import keycloak from '@/auth/keycloak'

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

  const backendUrl = import.meta.env.VITE_ERPEZ_BACKEND_URL || 'http://localhost:5245'

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
                localStorage.setItem('erpez_auth_token', keycloak.token)
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
            localStorage.removeItem('erpez_auth_token')
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
    if (isLiveKeycloak && keycloak) {
      keycloak.logout?.()
    } else {
      localStorage.removeItem('erpez_auth_token')
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
          localStorage.setItem('erpez_auth_token', keycloak.token)
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
        tenantId,
        isSuperAdmin,
        activeDevUser,
        login,
        logout,
        register,
        updateToken,
        switchDevUser,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  )
}

export function useKeycloak() {
  const context = useContext(KeycloakContext)
  if (context === undefined) {
    throw new Error('useKeycloak must be used within a KeycloakProvider')
  }
  return context
}
