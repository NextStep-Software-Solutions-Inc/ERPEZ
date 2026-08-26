import { createContext, useContext, useEffect, useState, useCallback } from 'react'
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
  const [isInitialized, setIsInitialized] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(true)
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
  const [userName, setUserName] = useState<string | null>('dev_planner')
  const [email, setEmail] = useState<string | null>('dev_planner@erpez.dev')
  const [firstName, setFirstName] = useState<string | null>('Planning Officer')
  const [lastName, setLastName] = useState<string | null>('')
  const [roles, setRoles] = useState<string[]>(['Planning Officer'])
  const [tenantId, setTenantId] = useState<string | null>('00000000-0000-0000-0000-000000000001')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [activeDevUser, setActiveDevUser] = useState<string>('dev_planner')

  const backendUrl = import.meta.env.VITE_ERPEZ_BACKEND_URL || 'http://localhost:5245'

  const loginAsDevUser = useCallback(async (username: string) => {
    if (typeof window === 'undefined') return false

    try {
      const response = await fetch(`${backendUrl}/auth/dev/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          tenantId: '00000000-0000-0000-0000-000000000001',
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
        setTenantId(user.tenantId || '00000000-0000-0000-0000-000000000001')
        setIsSuperAdmin(Boolean(user.isSuperAdmin))
        setActiveDevUser(user.userId)

        // Store in localStorage & sync keycloak instance
        try {
          localStorage.setItem('erpez_dev_user', user.userId)
          localStorage.setItem('erpez_auth_token', jwtToken)
          localStorage.setItem('erpez_tenant_id', user.tenantId || '00000000-0000-0000-0000-000000000001')
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const init = async () => {
      let savedUser = 'dev_planner'
      try {
        savedUser = localStorage.getItem('erpez_dev_user') || 'dev_planner'
      } catch {
        // Fallback
      }
      await loginAsDevUser(savedUser)
      setIsInitialized(true)
      if (onInitialized) onInitialized(true)
    }

    init()
  }, [loginAsDevUser, onInitialized])

  const switchDevUser = async (username: string) => {
    await loginAsDevUser(username)
  }

  const login = () => {
    keycloak?.login?.()
  }

  const logout = () => {
    keycloak?.logout?.()
  }

  const register = () => {
    keycloak?.register?.()
  }

  const updateToken = async (_minValidity = 5): Promise<boolean> => {
    return true
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
