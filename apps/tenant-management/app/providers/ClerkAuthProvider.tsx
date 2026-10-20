import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ClerkProvider, useAuth as useClerkSdkAuth, useUser as useClerkSdkUser, useClerk } from '@clerk/clerk-react';
import { setAuthToken, setAuthTokenGetter } from '~/services/api';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
  role: string | null;
  tenantId: string | null;
  isSuperAdmin: boolean;
  publicMetadata?: Record<string, unknown>;
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
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
  register: () => void;
  updateToken: (minValidity?: number) => Promise<boolean>;
  isClerkLive: boolean;
  getToken: () => Promise<string | null>;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

interface ClerkAuthProviderProps {
  children: ReactNode;
  onInitialized?: (authenticated: boolean) => void;
}

/**
 * Inner bridge component active when Clerk SDK is mounted with a valid publishable key.
 * Strictly uses live Clerk identity tokens and session management with no offline fake personas.
 */
function ClerkBridgeInner({ children, onInitialized }: ClerkAuthProviderProps) {
  const { isSignedIn, isLoaded, getToken: getClerkToken } = useClerkSdkAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useClerkSdkUser();
  const clerk = useClerk();

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('erpez_auth_token');
        if (stored && stored.startsWith('ey')) {
          setAuthToken(stored);
          return stored;
        }
      } catch {
        // Ignore storage errors
      }
    }
    return null;
  });
  const [isTokenFetched, setIsTokenFetched] = useState(false);

  // Sync token from Clerk to Axios client
  useEffect(() => {
    let isMounted = true;

    async function syncToken() {
      if (!isLoaded) return;

      if (isSignedIn) {
        try {
          const sessionToken = await getClerkToken();
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
            setIsTokenFetched(true);
          }
        } catch (err) {
          console.error('Failed to obtain Clerk session token:', err);
          if (isMounted) {
            setToken(null);
            setAuthToken(null);
            setIsTokenFetched(true);
          }
        }
      } else {
        if (isMounted) {
          setToken(null);
          setAuthToken(null);
          setIsTokenFetched(true);
        }
      }
    }

    syncToken();
    return () => {
      isMounted = false;
    };
  }, [isSignedIn, isLoaded, getClerkToken]);

  // Register dynamic token getter with Axios for transparent background token refresh
  useEffect(() => {
    if (isSignedIn) {
      setAuthTokenGetter(getClerkToken);
    } else {
      setAuthTokenGetter(null);
    }
    return () => {
      setAuthTokenGetter(null);
    };
  }, [isSignedIn, getClerkToken]);

  const isInitialized = isLoaded && isUserLoaded && (!isSignedIn || isTokenFetched);

  useEffect(() => {
    if (isInitialized && onInitialized) {
      onInitialized(Boolean(isSignedIn));
    }
  }, [isInitialized, isSignedIn, onInitialized]);

  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() || '';
  const configuredAdminEmails = (
    (import.meta.env.VITE_PLATFORM_ADMIN_EMAILS as string | undefined) ||
    (import.meta.env.VITE_SUPER_ADMIN_EMAILS as string | undefined) ||
    ''
  )
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  const isEmailAdmin = Boolean(userEmail && configuredAdminEmails.length > 0 && configuredAdminEmails.includes(userEmail));

  const metadataRoles = (clerkUser?.publicMetadata?.roles as string[]) ||
    (clerkUser?.publicMetadata?.role ? [clerkUser.publicMetadata.role as string] : []);
  const roles = metadataRoles.length > 0
    ? metadataRoles
    : (isEmailAdmin ? ['Platform Administrator'] : []);

  const role = (clerkUser?.publicMetadata?.role as string) || roles[0] || (isEmailAdmin ? 'Platform Administrator' : null);
  const tenantId = (clerkUser?.publicMetadata?.tenantId as string) ||
    (typeof window !== 'undefined' ? localStorage.getItem('erpez_tenant_id') : null) ||
    null;

  const isSuperAdmin = Boolean(
    clerkUser?.publicMetadata?.isSuperAdmin === true ||
    role === 'super-admin' ||
    role === 'platform_administrator' ||
    role === 'Platform Administrator'
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

  useEffect(() => {
    if (clerkUser?.primaryEmailAddress?.emailAddress && typeof window !== 'undefined') {
      try {
        const email = clerkUser.primaryEmailAddress.emailAddress.toLowerCase().trim();
        const previousEmail = localStorage.getItem('erpez_user_email');
        if (previousEmail && previousEmail !== email) {
          // User switched accounts: clear stale tenant selections and spectator sessions
          localStorage.removeItem('erpez_spectating_tenant');
          localStorage.removeItem('erpez_tenant_id');
        }
        localStorage.setItem('erpez_user_email', email);
        sessionStorage.setItem('erpez_user_email', email);
      } catch {}
    }
  }, [clerkUser?.primaryEmailAddress?.emailAddress]);

  const login = () => {
    clerk.openSignIn();
  };

  const logout = () => {
    clerk.signOut();
    try {
      localStorage.removeItem('erpez_auth_token');
      localStorage.removeItem('erpez_spectating_tenant');
      localStorage.removeItem('erpez_tenant_id');
      localStorage.removeItem('erpez_user_email');
      sessionStorage.removeItem('erpez_user_email');
    } catch {
      // Ignore
    }
  };

  const register = () => {
    clerk.openSignUp();
  };

  const updateToken = async () => {
    const freshToken = await getClerkToken();
    setToken(freshToken);
    setAuthToken(freshToken);
    return Boolean(freshToken);
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
        user: mappedUser,
        login,
        logout,
        register,
        updateToken,
        isClerkLive: true,
        getToken: getClerkToken,
      }}
    >
      {children}
    </ClerkAuthContext.Provider>
  );
}

const DEFAULT_DEV_CLERK_PUBLISHABLE_KEY =
  'pk_test_YWRhcHRpbmctc3RhbGxpb24tMjYuY2xlcmsuYWNjb3VudHMuZGV2JA';

/**
 * Main Clerk Auth Provider. Enforces live Clerk authentication with zero offline bypass mode.
 */
export function ClerkAuthProvider({ children, onInitialized }: ClerkAuthProviderProps) {
  const envKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const publishableKey =
    envKey && envKey.startsWith('pk_') && !envKey.includes('placeholder')
      ? envKey
      : DEFAULT_DEV_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkBridgeInner onInitialized={onInitialized}>{children}</ClerkBridgeInner>
    </ClerkProvider>
  );
}

export function useClerkAuth() {
  const context = useContext(ClerkAuthContext);
  if (context === undefined) {
    throw new Error('useClerkAuth must be used within a ClerkAuthProvider');
  }
  return context;
}

export function useAuth() {
  const { isAuthenticated, isInitialized, token, login, logout, user, getToken } = useClerkAuth();
  return {
    isSignedIn: isAuthenticated,
    isLoaded: isInitialized,
    userId: user?.id || (token ? 'user_active' : null),
    sessionId: token ? 'session_active' : null,
    getToken: getToken,
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
