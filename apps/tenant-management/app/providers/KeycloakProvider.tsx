import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type Keycloak from 'keycloak-js';
import keycloak from '~/auth/keycloak';
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
  publicMetadata?: {
    role?: string;
  };
}

export interface KeycloakContextType {
  keycloak: Keycloak | null;
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
  loginInApp: (payload: {
    usernameOrEmail: string;
    password: string;
    rememberMe?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  registerInApp: (payload: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateToken: (minValidity?: number) => Promise<boolean>;
  switchDevUser: (username: string) => Promise<void>;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

interface KeycloakProviderProps {
  children: ReactNode;
  onInitialized?: (authenticated: boolean) => void;
}

const DEV_PERSONAS: Record<
  string,
  {
    userId: string;
    externalIdentityId: string;
    displayName: string;
    email: string;
    roles: string[];
    tenantId: string;
    isSuperAdmin: boolean;
  }
> = {
  // --- PLATFORM CONTROL PLANE PERSONAS ---
  dev_superadmin: {
    userId: 'dev_superadmin',
    externalIdentityId: 'dev_superadmin',
    displayName: 'Super Administrator',
    email: 'superadmin@erpez.dev',
    roles: ['platform_administrator'],
    tenantId: '00000000-0000-0000-0000-000000000001',
    isSuperAdmin: true,
  },
  dev_platform_auditor: {
    userId: 'dev_platform_auditor',
    externalIdentityId: 'dev_platform_auditor',
    displayName: 'Jane Smith (Auditor)',
    email: 'auditor@erpez.dev',
    roles: ['platform_auditor'],
    tenantId: '00000000-0000-0000-0000-000000000001',
    isSuperAdmin: true, // Has access to view platform plane
  },
  dev_platform_support: {
    userId: 'dev_platform_support',
    externalIdentityId: 'dev_platform_support',
    displayName: 'John Doe (Support)',
    email: 'support@erpez.dev',
    roles: ['platform_support'],
    tenantId: '00000000-0000-0000-0000-000000000001',
    isSuperAdmin: true, // Has access to view platform plane
  },

  // --- TENANT WORKSPACE PLANE PERSONAS ---
  dev_admin: {
    userId: 'dev_admin',
    externalIdentityId: 'dev_admin',
    displayName: 'Workspace Admin',
    email: 'admin.north@erpez.dev',
    roles: ['Tenant Administrator'],
    tenantId: '00000000-0000-0000-0000-000000000010',
    isSuperAdmin: false,
  },
  dev_planner: {
    userId: 'dev_planner',
    externalIdentityId: 'dev_planner',
    displayName: 'Planning Officer',
    email: 'planner.north@erpez.dev',
    roles: ['Planning Officer'],
    tenantId: '00000000-0000-0000-0000-000000000010',
    isSuperAdmin: false,
  },
  dev_finance: {
    userId: 'dev_finance',
    externalIdentityId: 'dev_finance',
    displayName: 'Finance Officer',
    email: 'finance.north@erpez.dev',
    roles: ['Finance Officer'],
    tenantId: '00000000-0000-0000-0000-000000000010',
    isSuperAdmin: false,
  },
};

export function KeycloakProvider({ children, onInitialized }: KeycloakProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('erpez_auth_token');
      return Boolean(stored && stored.startsWith('ey'));
    }
    return false;
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('erpez_auth_token');
        if (stored && stored.startsWith('ey')) {
          if (keycloak) {
            (keycloak as any).token = stored;
            (keycloak as any).authenticated = true;
          }
          setAuthToken(stored);
          return stored;
        }
      } catch {
        // Ignore
      }
    }
    return null;
  });

  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('erpez_dev_user') || 'dev_admin';
    }
    return 'dev_admin';
  });
  const [email, setEmail] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const dev = localStorage.getItem('erpez_dev_user');
      if (dev && DEV_PERSONAS[dev]) return DEV_PERSONAS[dev].email;
      return localStorage.getItem('erpez_email') || 'admin@erpez.dev';
    }
    return 'admin@erpez.dev';
  });
  const [displayName, setDisplayName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const dev = localStorage.getItem('erpez_dev_user');
      if (dev && DEV_PERSONAS[dev]) return DEV_PERSONAS[dev].displayName;
      return localStorage.getItem('erpez_display_name') || 'Tenant Admin (Dev)';
    }
    return 'Tenant Admin (Dev)';
  });
  const [roles, setRoles] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const dev = localStorage.getItem('erpez_dev_user');
      if (dev && DEV_PERSONAS[dev]) return DEV_PERSONAS[dev].roles;
      try {
        const stored = localStorage.getItem('erpez_roles');
        if (stored) return JSON.parse(stored);
      } catch {
        // Fallback
      }
    }
    return ['Tenant Administrator'];
  });
  const [tenantId, setTenantId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('erpez_tenant_id') || '00000000-0000-0000-0000-000000000001';
    }
    return '00000000-0000-0000-0000-000000000001';
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('erpez_is_super_admin');
      if (stored !== null) return stored === 'true';
      const dev = localStorage.getItem('erpez_dev_user');
      return dev === 'dev_superadmin';
    }
    return false;
  });
  const [activeDevUser, setActiveDevUser] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('erpez_dev_user') || 'dev_admin';
    }
    return 'dev_admin';
  });

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
              localStorage.setItem('erpez_auth_provider', 'dev');
              localStorage.setItem('erpez_dev_user', userObj.userId);
              localStorage.setItem('erpez_auth_token', jwtToken);
              localStorage.setItem('erpez_tenant_id', userObj.tenantId || '00000000-0000-0000-0000-000000000001');
              localStorage.setItem('erpez_is_super_admin', String(superAdminFlag));
              localStorage.setItem('erpez_display_name', userObj.displayName);
              localStorage.setItem('erpez_email', userObj.email);
              localStorage.setItem('erpez_roles', JSON.stringify(userObj.roles || fallback.roles));
            } catch {
              // Ignore storage errors
            }

            if (keycloak) {
              (keycloak as any).token = jwtToken;
              (keycloak as any).authenticated = true;
            }
            return true;
          }
        }
      } catch (error) {
        console.warn('Dev login network call fallback:', error);
      }

      // Offline / fallback dev persona handler
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
        localStorage.setItem('erpez_auth_provider', 'dev');
        localStorage.setItem('erpez_dev_user', fallback.userId);
        localStorage.setItem('erpez_auth_token', fallbackToken);
        localStorage.setItem('erpez_tenant_id', fallback.tenantId);
        localStorage.setItem('erpez_is_super_admin', String(superAdminFlag));
        localStorage.setItem('erpez_display_name', fallback.displayName);
        localStorage.setItem('erpez_email', fallback.email);
        localStorage.setItem('erpez_roles', JSON.stringify(fallback.roles));
      } catch {
        // Ignore storage errors
      }

      if (keycloak) {
        (keycloak as any).token = fallbackToken;
        (keycloak as any).authenticated = true;
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
      // 1. If keycloak instance exists and hasn't been initialized, initialize it with PKCE check-sso
      if (keycloak && !keycloak.didInitialize) {
        try {
          const authenticated = await keycloak.init({
            onLoad: 'check-sso',
            checkLoginIframe: false,
            pkceMethod: 'S256',
          });

          if (authenticated && keycloak.token) {
            const jwtToken = keycloak.token;
            setToken(jwtToken);
            setAuthToken(jwtToken);
            setIsAuthenticated(true);

            const tokenParsed = (keycloak.tokenParsed || {}) as any;
            const uName = tokenParsed.preferred_username || tokenParsed.name || tokenParsed.sub || 'Keycloak User';
            const uEmail = tokenParsed.email || 'admin@erpez.dev';
            const uDisplayName = tokenParsed.name || uName;

            setUserName(uName);
            setEmail(uEmail);
            setDisplayName(uDisplayName);

            const realmRoles = tokenParsed.realm_access?.roles || [];
            const clientRoles = tokenParsed.resource_access?.['web-client']?.roles || [];
            const allRoles = [...realmRoles, ...clientRoles];
            const isSuper = allRoles.includes('SuperAdmin') || allRoles.includes('platform_administrator');
            setIsSuperAdmin(isSuper);
            setRoles(allRoles.length > 0 ? allRoles : ['Tenant Administrator']);

            try {
              localStorage.setItem('erpez_auth_provider', 'keycloak');
              localStorage.setItem('erpez_auth_token', jwtToken);
              localStorage.setItem('erpez_display_name', uDisplayName);
              localStorage.setItem('erpez_email', uEmail);
              localStorage.setItem('erpez_is_super_admin', String(isSuper));
            } catch {
              // Ignore storage errors
            }

            setIsInitialized(true);
            if (onInitialized) onInitialized(true);
            return;
          }
        } catch (kcErr) {
          console.warn('Keycloak check-sso initialization failed or unauthenticated:', kcErr);
        }
      }

      // 2. Check if user was previously authenticated via stored token or dev persona
      const stored = localStorage.getItem('erpez_auth_token');
      const authProvider = localStorage.getItem('erpez_auth_provider');

      if (stored && stored.startsWith('ey')) {
        const isSuper = localStorage.getItem('erpez_is_super_admin') === 'true';
        setIsSuperAdmin(isSuper);
        setIsAuthenticated(true);
        setToken(stored);
        setAuthToken(stored);
        setDisplayName(localStorage.getItem('erpez_display_name') || 'User');
        setEmail(localStorage.getItem('erpez_email') || '');
      } else if (authProvider === 'dev') {
        let savedUser = 'dev_admin';
        try {
          savedUser = localStorage.getItem('erpez_dev_user') || 'dev_admin';
        } catch {}
        await loginAsDevUser(savedUser);
      } else {
        // Default to unauthenticated on sign-in screen
        setIsAuthenticated(false);
        setToken(null);
        setAuthToken(null);
      }

      setIsInitialized(true);
      if (onInitialized) onInitialized(true);
    };

    init();
  }, [loginAsDevUser, onInitialized]);

  const switchDevUser = async (newUsername: string) => {
    await loginAsDevUser(newUsername);
  };

  const login = async () => {
    const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'https://keycloak.dev.nextstep-software.com';
    const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'erpez';
    const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'web-client';
    const redirectUri = window.location.origin + '/overview';

    if (keycloak) {
      try {
        if (!keycloak.didInitialize) {
          await keycloak.init({
            onLoad: 'login-required',
            checkLoginIframe: false,
            pkceMethod: 'S256',
            redirectUri,
          });
          return;
        }

        await keycloak.login({
          redirectUri,
        });
        return;
      } catch (err) {
        console.warn('Keycloak.js login threw, falling back to direct redirect:', err);
      }
    }

    // Direct browser redirect fallback to Keycloak authorization endpoint
    const authUrl = `${keycloakUrl.replace(/\/+$/, '')}/realms/${realm}/protocol/openid-connect/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid`;
    window.location.href = authUrl;
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
        localStorage.removeItem('erpez_auth_provider');
      } catch {
        // Ignore
      }
    }
    setToken(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    setIsSuperAdmin(false);

    if (keycloak && keycloak.didInitialize && keycloak.logout) {
      try {
        keycloak.logout({ redirectUri: window.location.origin + '/sign-in' });
        return;
      } catch (err) {
        console.warn('Keycloak logout threw:', err);
      }
    }
    window.location.href = '/sign-in';
  };

  const register = async () => {
    const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'https://keycloak.dev.nextstep-software.com';
    const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'erpez';
    const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'web-client';
    const redirectUri = window.location.origin + '/overview';

    if (keycloak && keycloak.didInitialize) {
      try {
        await keycloak.register({ redirectUri });
        return;
      } catch (err) {
        console.warn('Keycloak.js register threw, falling back to direct redirect:', err);
      }
    }

    const regUrl = `${keycloakUrl.replace(/\/+$/, '')}/realms/${realm}/protocol/openid-connect/registrations?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid`;
    window.location.href = regUrl;
  };

  const loginInApp = async (payload: {
    usernameOrEmail: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok || !json.succeeded) {
        return {
          success: false,
          error: json.message || json.errors?.[0] || 'Invalid username or password.',
        };
      }

      const authData = json.data;
      if (authData?.token) {
        const jwtToken = authData.token;
        const userObj = authData.user;
        const assignedTenantId = authData.tenant?.id || userObj?.tenantId || '00000000-0000-0000-0000-000000000001';
        const superAdminFlag = Boolean(userObj?.isSuperAdmin);

        setToken(jwtToken);
        setRefreshToken(authData.refreshToken || null);
        setAuthToken(jwtToken);
        setIsAuthenticated(true);
        setUserName(userObj.userId);
        setEmail(userObj.email);
        setDisplayName(userObj.displayName || userObj.userId);
        setRoles(userObj.roles || ['Tenant Administrator']);
        setTenantId(assignedTenantId);
        setIsSuperAdmin(superAdminFlag);

        try {
          localStorage.setItem('erpez_auth_provider', 'in_app');
          localStorage.setItem('erpez_auth_token', jwtToken);
          if (authData.refreshToken) {
            localStorage.setItem('erpez_refresh_token', authData.refreshToken);
          }
          localStorage.setItem('erpez_tenant_id', assignedTenantId);
          localStorage.setItem('erpez_is_super_admin', String(superAdminFlag));
          localStorage.setItem('erpez_display_name', userObj.displayName || userObj.userId);
          localStorage.setItem('erpez_email', userObj.email);
          localStorage.setItem('erpez_roles', JSON.stringify(userObj.roles || ['Tenant Administrator']));
          if (payload.rememberMe) {
            localStorage.setItem('erpez_remembered_username', payload.usernameOrEmail);
          } else {
            localStorage.removeItem('erpez_remembered_username');
          }
        } catch {
          // Ignore
        }

        if (keycloak) {
          (keycloak as any).token = jwtToken;
          (keycloak as any).authenticated = true;
        }

        return { success: true };
      }

      return { success: false, error: 'Token missing in authentication response.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error during login.' };
    }
  };

  const registerInApp = async (payload: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok || !json.succeeded) {
        return {
          success: false,
          error: json.message || json.errors?.[0] || 'Registration failed.',
        };
      }

      const authData = json.data;
      if (authData?.token) {
        const jwtToken = authData.token;
        const userObj = authData.user;
        const assignedTenantId = authData.tenant?.id || userObj?.tenantId;

        setToken(jwtToken);
        setAuthToken(jwtToken);
        setIsAuthenticated(true);
        setUserName(userObj.userId);
        setEmail(userObj.email);
        setDisplayName(userObj.displayName);
        setRoles(userObj.roles || ['Tenant Administrator']);
        setTenantId(assignedTenantId);
        setIsSuperAdmin(false);

        try {
          localStorage.setItem('erpez_auth_provider', 'in_app');
          localStorage.setItem('erpez_auth_token', jwtToken);
          localStorage.setItem('erpez_tenant_id', assignedTenantId);
          localStorage.setItem('erpez_is_super_admin', 'false');
          localStorage.setItem('erpez_display_name', userObj.displayName);
          localStorage.setItem('erpez_email', userObj.email);
          localStorage.setItem('erpez_roles', JSON.stringify(userObj.roles || ['Tenant Administrator']));
        } catch {
          // Ignore
        }

        if (keycloak) {
          (keycloak as any).token = jwtToken;
          (keycloak as any).authenticated = true;
        }

        return { success: true };
      }

      return { success: false, error: 'Token missing in registration response.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error during registration.' };
    }
  };

  const updateToken = async (_minValidity = 5): Promise<boolean> => {
    return true;
  };

  const user: AuthUser | null = isAuthenticated
    ? {
        id: userName || 'dev_user',
        username: userName || 'Admin',
        email: email || 'admin@erpez.dev',
        displayName: displayName || userName || 'User',
        roles: roles,
        role: roles[0] || (isSuperAdmin ? 'super-admin' : 'tenant-admin'),
        tenantId: tenantId,
        isSuperAdmin: isSuperAdmin,
        publicMetadata: {
          role: isSuperAdmin ? 'super-admin' : 'tenant-admin',
        },
      }
    : null;

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
        loginInApp,
        registerInApp,
        updateToken,
        switchDevUser,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
}

export function useKeycloak() {
  const context = useContext(KeycloakContext);
  if (context === undefined) {
    throw new Error('useKeycloak must be used within a KeycloakProvider');
  }
  return context;
}

export function useAuth() {
  const { isAuthenticated, isInitialized, token, login, logout } = useKeycloak();
  return {
    isSignedIn: isAuthenticated,
    isLoaded: isInitialized,
    userId: token ? 'user_active' : null,
    sessionId: token ? 'session_active' : null,
    getToken: async () => token,
    signOut: logout,
    signIn: login,
  };
}

export function useUser() {
  const { user, isInitialized } = useKeycloak();
  return {
    user,
    isLoaded: isInitialized,
    isSignedIn: !!user,
  };
}
