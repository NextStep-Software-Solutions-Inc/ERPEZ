import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { ClerkProvider, useAuth as useClerkSdkAuth, useUser as useClerkSdkUser, useClerk } from '@clerk/clerk-react';
import { setAuthToken } from '~/services/api';

export interface DevUser {
  userId: string;
  externalIdentityId: string;
  displayName: string;
  email: string;
  roles: string[];
  tenantId: string;
  isSuperAdmin: boolean;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
  role: string | null;
  tenantId: string | null;
  isSuperAdmin: boolean;
  publicMetadata?: Record<string, any>;
}

export interface ClerkAuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  token: string | null;
  refreshToken: string | null;
  userName: string | null;
  email: string | null;
  displayName: string | null;
  role: string | null;
  roles: string[];
  tenantId: string | null;
  isSuperAdmin: boolean;
  activeDevUser: string;
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
  register: () => void;
  updateToken: (minValidity?: number) => Promise<boolean>;
  switchDevUser: (username: string) => Promise<void>;
  isClerkLive: boolean;
}

export const DEV_PERSONAS: Record<string, DevUser> = {
  // --- PLATFORM CONTROL PLANE PERSONAS ---
  dev_superadmin: {
    userId: 'dev_superadmin',
    externalIdentityId: 'user_dev_superadmin',
    displayName: 'Super Administrator',
    email: 'superadmin@erpez.dev',
    roles: ['platform_administrator'],
    tenantId: '00000000-0000-0000-0000-000000000001',
    isSuperAdmin: true,
  },
  dev_platform_auditor: {
    userId: 'dev_platform_auditor',
    externalIdentityId: 'user_dev_platform_auditor',
    displayName: 'Jane Smith (Auditor)',
    email: 'auditor@erpez.dev',
    roles: ['platform_auditor'],
    tenantId: '00000000-0000-0000-0000-000000000001',
    isSuperAdmin: true,
  },
  dev_platform_support: {
    userId: 'dev_platform_support',
    externalIdentityId: 'user_dev_platform_support',
    displayName: 'John Doe (Support)',
    email: 'support@erpez.dev',
    roles: ['platform_support'],
    tenantId: '00000000-0000-0000-0000-000000000001',
    isSuperAdmin: true,
  },

  // --- TENANT WORKSPACE PLANE PERSONAS ---
  dev_admin: {
    userId: 'dev_admin',
    externalIdentityId: 'user_dev_admin',
    displayName: 'Workspace Admin',
    email: 'admin.north@erpez.dev',
    roles: ['Tenant Administrator'],
    tenantId: '00000000-0000-0000-0000-000000000010',
    isSuperAdmin: false,
  },
  dev_planner: {
    userId: 'dev_planner',
    externalIdentityId: 'user_dev_planner',
    displayName: 'Planning Officer',
    email: 'planner.north@erpez.dev',
    roles: ['Planning Officer'],
    tenantId: '00000000-0000-0000-0000-000000000010',
    isSuperAdmin: false,
  },
  dev_finance: {
    userId: 'dev_finance',
    externalIdentityId: 'user_dev_finance',
    displayName: 'Finance Officer',
    email: 'finance.north@erpez.dev',
    roles: ['Finance Officer'],
    tenantId: '00000000-0000-0000-0000-000000000010',
    isSuperAdmin: false,
  },
};

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

interface ClerkAuthProviderProps {
  children: ReactNode;
  onInitialized?: (authenticated: boolean) => void;
}

/**
 * Inner bridge component active when Clerk SDK is mounted with a valid publishable key.
 */
function ClerkBridgeInner({ children, onInitialized }: ClerkAuthProviderProps) {
  const { isSignedIn, isLoaded, getToken } = useClerkSdkAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useClerkSdkUser();
  const clerk = useClerk();

  const [token, setToken] = useState<string | null>(null);
  const [activeDevUser, setActiveDevUser] = useState<string>('clerk_user');

  // Sync token from Clerk to Axios client
  useEffect(() => {
    let isMounted = true;

    async function syncToken() {
      if (isSignedIn) {
        try {
          const sessionToken = await getToken();
          if (isMounted) {
            setToken(sessionToken);
            setAuthToken(sessionToken);
            if (sessionToken) {
              try {
                localStorage.setItem('erpez_auth_token', sessionToken);
              } catch {
                // Ignore storage errors
              }
            }
          }
        } catch (err) {
          console.error('Failed to obtain Clerk session token:', err);
          if (isMounted) {
            setToken(null);
            setAuthToken(null);
          }
        }
      } else {
        if (isMounted) {
          setToken(null);
          setAuthToken(null);
        }
      }
    }

    syncToken();
    return () => {
      isMounted = false;
    };
  }, [isSignedIn, getToken]);

  const isInitialized = isLoaded && isUserLoaded;

  useEffect(() => {
    if (isInitialized && onInitialized) {
      onInitialized(Boolean(isSignedIn));
    }
  }, [isInitialized, isSignedIn, onInitialized]);

  const roles = (clerkUser?.publicMetadata?.roles as string[]) ||
    (clerkUser?.publicMetadata?.role ? [clerkUser.publicMetadata.role as string] : ['Tenant Administrator']);
  const role = (clerkUser?.publicMetadata?.role as string) || roles[0] || 'Tenant Administrator';
  const tenantId = (clerkUser?.publicMetadata?.tenantId as string) ||
    (typeof window !== 'undefined' ? localStorage.getItem('erpez_tenant_id') : null) ||
    '00000000-0000-0000-0000-000000000001';

  const isSuperAdmin = Boolean(
    role === 'super-admin' ||
    role === 'platform_administrator' ||
    role === 'Platform Administrator' ||
    clerkUser?.publicMetadata?.isSuperAdmin === true
  );

  const mappedUser: AuthUser | null = isSignedIn && clerkUser
    ? {
        id: clerkUser.id,
        username: clerkUser.username || clerkUser.firstName || 'User',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        displayName: clerkUser.fullName || clerkUser.firstName || 'User',
        roles,
        role,
        tenantId,
        isSuperAdmin,
        publicMetadata: clerkUser.publicMetadata,
      }
    : null;

  const login = () => {
    clerk.openSignIn();
  };

  const logout = () => {
    clerk.signOut();
    try {
      localStorage.removeItem('erpez_auth_token');
    } catch {
      // Ignore
    }
  };

  const register = () => {
    clerk.openSignUp();
  };

  const updateToken = async () => {
    const freshToken = await getToken();
    setToken(freshToken);
    setAuthToken(freshToken);
    return Boolean(freshToken);
  };

  const switchDevUser = async (username: string) => {
    console.warn(`Persona switching (${username}) in live Clerk mode. Use dev mode if persona switching is needed.`);
  };

  return (
    <ClerkAuthContext.Provider
      value={{
        isAuthenticated: Boolean(isSignedIn),
        isInitialized,
        token,
        refreshToken: null,
        userName: mappedUser?.username || null,
        email: mappedUser?.email || null,
        displayName: mappedUser?.displayName || null,
        role,
        roles,
        tenantId,
        isSuperAdmin,
        activeDevUser,
        user: mappedUser,
        login,
        logout,
        register,
        updateToken,
        switchDevUser,
        isClerkLive: true,
      }}
    >
      {children}
    </ClerkAuthContext.Provider>
  );
}

/**
 * Offline / Dev Mode Provider when Clerk Publishable Key is not provided or dev persona mode is active.
 */
function DevPersonaProvider({ children, onInitialized }: ClerkAuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('erpez_auth_token');
        if (stored && stored.startsWith('ey')) {
          setAuthToken(stored);
          return stored;
        }
      } catch {
        // Ignore
      }
    }
    return null;
  });

  const [userName, setUserName] = useState<string | null>('dev_admin');
  const [email, setEmail] = useState<string | null>('admin@erpez.dev');
  const [displayName, setDisplayName] = useState<string | null>('Workspace Admin');
  const [roles, setRoles] = useState<string[]>(['Tenant Administrator']);
  const [tenantId, setTenantId] = useState<string | null>('00000000-0000-0000-0000-000000000001');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeDevUser, setActiveDevUser] = useState<string>('dev_admin');

  const backendUrl = import.meta.env.VITE_ERPEZ_BACKEND_URL || 'http://localhost:5246';

  const loginAsDevUser = useCallback(
    async (username: string) => {
      if (typeof window === 'undefined') return false;

      const fallback = DEV_PERSONAS[username] || DEV_PERSONAS['dev_admin'];

      try {
        const response = await fetch(`${backendUrl}/auth/dev/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            tenantId: '00000000-0000-0000-0000-000000000001',
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const authData = json?.data;
          if (authData?.token) {
            const jwtToken = authData.token;
            const userObj = authData.user;
            const superAdminFlag = Boolean(userObj?.isSuperAdmin || username === 'dev_superadmin');

            setToken(jwtToken);
            setAuthToken(jwtToken);
            setIsAuthenticated(true);
            setUserName(userObj.userId);
            setEmail(userObj.email);
            setDisplayName(userObj.displayName);
            setRoles(userObj.roles || fallback.roles);
            setTenantId(userObj.tenantId || '00000000-0000-0000-0000-000000000001');
            setIsSuperAdmin(superAdminFlag);
            setActiveDevUser(userObj.userId);

            try {
              localStorage.setItem('erpez_dev_user', userObj.userId);
              localStorage.setItem('erpez_auth_token', jwtToken);
              localStorage.setItem('erpez_tenant_id', userObj.tenantId || '00000000-0000-0000-0000-000000000001');
              localStorage.setItem('erpez_is_super_admin', String(superAdminFlag));
              localStorage.setItem('erpez_display_name', userObj.displayName);
              localStorage.setItem('erpez_email', userObj.email);
              localStorage.setItem('erpez_roles', JSON.stringify(userObj.roles || fallback.roles));
            } catch {
              // Ignore
            }

            return true;
          }
        }
      } catch (error) {
        console.warn('Dev login network call fallback:', error);
      }

      // Offline fallback token
      const superAdminFlag = Boolean(fallback.isSuperAdmin || username === 'dev_superadmin');
      const fallbackToken = `dev_token_${fallback.userId}_${Date.now()}`;

      setToken(fallbackToken);
      setAuthToken(fallbackToken);
      setIsAuthenticated(true);
      setUserName(fallback.userId);
      setEmail(fallback.email);
      setDisplayName(fallback.displayName);
      setRoles(fallback.roles);
      setTenantId(fallback.tenantId);
      setIsSuperAdmin(superAdminFlag);
      setActiveDevUser(fallback.userId);

      try {
        localStorage.setItem('erpez_dev_user', fallback.userId);
        localStorage.setItem('erpez_auth_token', fallbackToken);
        localStorage.setItem('erpez_tenant_id', fallback.tenantId);
        localStorage.setItem('erpez_is_super_admin', String(superAdminFlag));
        localStorage.setItem('erpez_display_name', fallback.displayName);
        localStorage.setItem('erpez_email', fallback.email);
        localStorage.setItem('erpez_roles', JSON.stringify(fallback.roles));
      } catch {
        // Ignore
      }

      return true;
    },
    [backendUrl]
  );

  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      let savedUser = 'dev_admin';
      try {
        savedUser = localStorage.getItem('erpez_dev_user') || 'dev_admin';
      } catch {
        // Fallback
      }

      const stored = localStorage.getItem('erpez_auth_token');
      if (!stored || !stored.startsWith('ey')) {
        await loginAsDevUser(savedUser);
      } else {
        const isSuper = localStorage.getItem('erpez_is_super_admin') === 'true' || savedUser === 'dev_superadmin';
        setIsSuperAdmin(isSuper);
        setActiveDevUser(savedUser);
        if (DEV_PERSONAS[savedUser]) {
          setDisplayName(DEV_PERSONAS[savedUser].displayName);
          setEmail(DEV_PERSONAS[savedUser].email);
          setRoles(DEV_PERSONAS[savedUser].roles);
        }
      }
      setIsInitialized(true);
      if (onInitialized) onInitialized(true);
    };

    init();
  }, [loginAsDevUser, onInitialized]);

  const switchDevUser = async (newUsername: string) => {
    await loginAsDevUser(newUsername);
  };

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('erpez_auth_token');
        localStorage.removeItem('erpez_dev_user');
        localStorage.removeItem('erpez_is_super_admin');
        localStorage.removeItem('erpez_display_name');
        localStorage.removeItem('erpez_email');
        localStorage.removeItem('erpez_roles');
        localStorage.removeItem('erpez_tenant_id');
      } catch {
        // Ignore
      }
    }
    setToken(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    setIsSuperAdmin(false);
  };

  const register = () => {
    setIsAuthenticated(true);
  };

  const updateToken = async () => {
    return true;
  };

  const user: AuthUser | null = isAuthenticated
    ? {
        id: DEV_PERSONAS[activeDevUser]?.externalIdentityId || activeDevUser,
        username: userName || 'Admin',
        email: email || 'admin@erpez.dev',
        displayName: displayName || userName || 'User',
        roles,
        role: roles[0] || (isSuperAdmin ? 'super-admin' : 'tenant-admin'),
        tenantId,
        isSuperAdmin,
        publicMetadata: {
          role: isSuperAdmin ? 'super-admin' : 'tenant-admin',
        },
      }
    : null;

  return (
    <ClerkAuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        token,
        refreshToken: null,
        userName,
        email,
        displayName,
        role: roles[0] || null,
        roles,
        tenantId,
        isSuperAdmin,
        activeDevUser,
        user,
        login,
        logout,
        register,
        updateToken,
        switchDevUser,
        isClerkLive: false,
      }}
    >
      {children}
    </ClerkAuthContext.Provider>
  );
}

/**
 * Main Clerk Auth Provider. If VITE_CLERK_PUBLISHABLE_KEY is valid, mounts ClerkProvider;
 * otherwise runs in developer persona mode.
 */
export function ClerkAuthProvider({ children, onInitialized }: ClerkAuthProviderProps) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = Boolean(
    publishableKey &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('placeholder')
  );

  if (isClerkConfigured) {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        <ClerkBridgeInner onInitialized={onInitialized}>{children}</ClerkBridgeInner>
      </ClerkProvider>
    );
  }

  return <DevPersonaProvider onInitialized={onInitialized}>{children}</DevPersonaProvider>;
}

export function useClerkAuth() {
  const context = useContext(ClerkAuthContext);
  if (context === undefined) {
    throw new Error('useClerkAuth must be used within a ClerkAuthProvider');
  }
  return context;
}

// Backward-compatible hook alias for existing components
export const useKeycloak = useClerkAuth;
export const KeycloakProvider = ClerkAuthProvider;

export function useAuth() {
  const { isAuthenticated, isInitialized, token, login, logout, user } = useClerkAuth();
  return {
    isSignedIn: isAuthenticated,
    isLoaded: isInitialized,
    userId: user?.id || (token ? 'user_active' : null),
    sessionId: token ? 'session_active' : null,
    getToken: async () => token,
    signOut: logout,
    signIn: login,
  };
}

export function useUser() {
  const { user, isInitialized } = useClerkAuth();
  return {
    user,
    isLoaded: isInitialized,
    isSignedIn: !!user,
  };
}
