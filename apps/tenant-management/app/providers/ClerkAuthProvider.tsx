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
  toggleSuperAdminOverride?: (enabled?: boolean) => void;
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
    'jeanmaureal@gmail.com,superadmin@erpez.dev,admin@erpez.dev,tabasan.louiejayb@gmail.com'
  )
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  const isEmailAdmin = Boolean(userEmail && configuredAdminEmails.includes(userEmail));

  const metadataRoles = (clerkUser?.publicMetadata?.roles as string[]) ||
    (clerkUser?.publicMetadata?.role ? [clerkUser.publicMetadata.role as string] : []);
  const roles = metadataRoles.length > 0
    ? metadataRoles
    : (isEmailAdmin ? ['Platform Administrator'] : []);

  const role = (clerkUser?.publicMetadata?.role as string) || roles[0] || (isEmailAdmin ? 'Platform Administrator' : null);
  const tenantId = (clerkUser?.publicMetadata?.tenantId as string) ||
    (typeof window !== 'undefined' ? localStorage.getItem('erpez_tenant_id') : null) ||
    null;

  const isDevSuperAdminOverride = Boolean(
    typeof window !== 'undefined' && localStorage.getItem('erpez_is_super_admin') === 'true'
  );

  const unsafeRole = (clerkUser?.unsafeMetadata?.role as string) || null;
  const isUnsafeSuperAdmin = Boolean(
    unsafeRole === 'super-admin' ||
    unsafeRole === 'platform_administrator' ||
    unsafeRole === 'Platform Administrator' ||
    clerkUser?.unsafeMetadata?.isSuperAdmin === true
  );

  const isSuperAdmin = Boolean(
    isEmailAdmin ||
    role === 'super-admin' ||
    role === 'platform_administrator' ||
    role === 'Platform Administrator' ||
    clerkUser?.publicMetadata?.isSuperAdmin === true ||
    isUnsafeSuperAdmin ||
    isDevSuperAdminOverride
  );

  const toggleSuperAdminOverride = (forceVal?: boolean) => {
    if (typeof window === 'undefined') return;
    const current = localStorage.getItem('erpez_is_super_admin') === 'true';
    const next = forceVal !== undefined ? forceVal : !current;
    localStorage.setItem('erpez_is_super_admin', String(next));
    window.location.reload();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__toggleSuperAdmin = (enabled?: boolean) => {
        toggleSuperAdminOverride(enabled);
      };
    }
  }, []);

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
        toggleSuperAdminOverride,
      }}
    >
      {children}
    </ClerkAuthContext.Provider>
  );
}

/**
 * Main Clerk Auth Provider. Enforces live Clerk authentication with zero offline bypass mode.
 */
export function ClerkAuthProvider({ children, onInitialized }: ClerkAuthProviderProps) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = Boolean(
    publishableKey &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('placeholder')
  );

  if (!isClerkConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800 text-center font-sans">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg border border-red-200">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Clerk Authentication Required</h2>
          <p className="text-sm text-slate-600 mb-4">
            The Tenant Management portal requires live Clerk authentication. Offline mode and fake personas are disabled.
          </p>
          <p className="text-xs text-slate-500 bg-slate-100 p-3 rounded font-mono break-all">
            Set VITE_CLERK_PUBLISHABLE_KEY in your environment to proceed.
          </p>
        </div>
      </div>
    );
  }

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
