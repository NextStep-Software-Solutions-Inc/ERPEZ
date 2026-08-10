import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type Keycloak from 'keycloak-js'
import keycloak from '@/auth/keycloak'

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
  login: () => void
  logout: () => void
  register: () => void
  updateToken: (minValidity?: number) => Promise<boolean>
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
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastName, setLastName] = useState<string | null>(null)

  useEffect(() => {
    // Temporary bypass Keycloak authentication
    setIsInitialized(true)
    setIsAuthenticated(true)
    setUserName('Dev User')
    setEmail('dev@example.com')
    setFirstName('Dev')
    setLastName('User')
    setToken('mock-token')

    return () => { }
    /* 
    let tokenRefreshInterval: ReturnType<typeof setInterval> | undefined
    // Track if Keycloak has already been initialized
    // let alreadyInitialized = (keycloak as any)._erpez_initialized || false
    const alreadyInitialized = (keycloak as any)._erpez_initialized || false
    // const alreadyInitialized = true

    const initKeycloak = async () => {
      if (alreadyInitialized) {
        setIsInitialized(true)
        return
      }
      try {
        const authenticated = await keycloak.init(initOptions)

        setIsAuthenticated(authenticated)
        setToken(keycloak.token || null)
        setRefreshToken(keycloak.refreshToken || null)
        setIsInitialized(true)
        setUserName(keycloak.tokenParsed?.preferred_username || null)
        setEmail(keycloak.tokenParsed?.email || null)
        setFirstName(keycloak.tokenParsed?.given_name || null)
        setLastName(keycloak.tokenParsed?.family_name || null)

        // Set up token refresh
        if (authenticated) {
          // Refresh token every 5 minutes
          tokenRefreshInterval = setInterval(async () => {
            try {
              const refreshed = await keycloak.updateToken(70) // Refresh if token expires in 70 seconds
              if (refreshed) {
                setToken(keycloak.token || null)
                setRefreshToken(keycloak.refreshToken || null)
              }
            } catch (error) {
              if (onAuthError) {
                onAuthError(error)
              }
            }
          }, 300000) // 5 minutes
        }

        // Event listeners
        keycloak.onAuthSuccess = () => {
          setIsAuthenticated(true)
          setToken(keycloak.token || null)
          setRefreshToken(keycloak.refreshToken || null)
        }

        keycloak.onAuthError = (error) => {
          setIsAuthenticated(false)
          setToken(null)
          setRefreshToken(null)
          if (onAuthError) {
            onAuthError(error)
          }
        }

        keycloak.onAuthRefreshSuccess = () => {
          setToken(keycloak.token || null)
          setRefreshToken(keycloak.refreshToken || null)
        }

        keycloak.onAuthRefreshError = () => {
          setIsAuthenticated(false)
          setToken(null)
          setRefreshToken(null)
        }

        keycloak.onAuthLogout = () => {
          setIsAuthenticated(false)
          setToken(null)
          setRefreshToken(null)
        }

        keycloak.onTokenExpired = () => {
          keycloak.updateToken(30).catch((error) => {
            if (onAuthError) {
              onAuthError(error)
            }
          })
        }

        if (onInitialized) {
          onInitialized(authenticated)
        }
        // Mark as initialized to prevent double init
        ;(keycloak as any)._erpez_initialized = true
      } catch (error) {
        // Ensure initialization doesn't leave the app stuck in a loading state.
        console.error(error)
        setIsAuthenticated(false)
        setToken(null)
        setRefreshToken(null)
        setIsInitialized(true)

        if (onAuthError) {
          try {
            onAuthError(error)
          } catch (cbError) {
            console.error(cbError)
          }
        }
      }
    }

    // Only initialize on the client side
    if (typeof window !== 'undefined') {
      initKeycloak()
    }

    return () => {
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval)
      }
    }
    */
  }, [initOptions, onInitialized, onAuthError])

  const login = () => {
    keycloak.login()
  }

  const logout = () => {
    keycloak.logout()
  }

  const register = () => {
    keycloak.register()
  }

  const updateToken = async (minValidity = 5): Promise<boolean> => {
    try {
      const refreshed = await keycloak.updateToken(minValidity)
      if (refreshed) {
        setToken(keycloak.token || null)
        setRefreshToken(keycloak.refreshToken || null)
      }
      return refreshed
    } catch (error) {
      console.error('Failed to update token', error)
      return false
    }
  }

  // Show loading component while initializing
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
        login,
        logout,
        register,
        updateToken,
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
