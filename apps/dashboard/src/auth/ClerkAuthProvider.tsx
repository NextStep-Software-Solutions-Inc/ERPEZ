import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ClerkProvider,
  SignIn,
  useUser,
  useAuth,
  useOrganization,
  useOrganizationList,
  useClerk,
} from '@clerk/react';
import { UnifiedAuthContext } from './UnifiedAuthContext';
import type {
  UnifiedAuthContextType,
  UnifiedTenantContext,
  UnifiedUser,
  AuthState,
  TenantState,
} from './types';
import { setTokenProvider, setTenantProvider, setRefreshProvider } from './authBridge';
import axios from 'axios';

interface ClerkAuthProviderProps {
  children: React.ReactNode;
  publishableKey?: string;
}

function ClerkInnerAdapter({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth();
  const { user } = useUser();
  const { organization, memberships } = useOrganization({
    memberships: {
      infinite: true,
    },
  });
  const { setActive } = useOrganizationList({ userMemberships: { infinite: true } });
  const clerk = useClerk();

  const [activeTenant, setActiveTenant] = useState<UnifiedTenantContext | null>(null);
  const [availableTenants, setAvailableTenants] = useState<UnifiedTenantContext[]>([]);
  const [tenantState, setTenantState] = useState<TenantState>('loading');
  const [rawToken, setRawToken] = useState<string | null>(null);

  // Configure auth bridge
  useEffect(() => {
    setTokenProvider(async () => {
      try {
        const token = await getToken();
        setRawToken(token);
        return token;
      } catch {
        return null;
      }
    });

    setTenantProvider(() => activeTenant?.id || null);

    setRefreshProvider(async () => {
      try {
        const refreshedToken = await getToken({ skipCache: true });
        setRawToken(refreshedToken);
        return Boolean(refreshedToken);
      } catch {
        return false;
      }
    });
  }, [getToken, activeTenant]);

  // Eagerly set raw token when signed in
  useEffect(() => {
    if (isSignedIn) {
      getToken().then((token) => {
        if (token) setRawToken(token);
      });
    }
  }, [isSignedIn, getToken]);

  // Bootstrap tenant context from backend
  const fetchTenantContext = useCallback(async () => {
    if (!isSignedIn) {
      setActiveTenant(null);
      setAvailableTenants([]);
      setTenantState('unavailable');
      return;
    }

    try {
      setTenantState('loading');
      const token = await getToken();
      if (!token) {
        setTenantState('unavailable');
        return;
      }
      setRawToken(token);

      const backendUrl = import.meta.env.VITE_ERPEZ_BACKEND_URL || 'http://localhost:5245';
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch available workspaces authorized for this identity
      const candidateId = typeof window !== 'undefined'
        ? (sessionStorage.getItem('erpez_candidate_tenant_id') || localStorage.getItem('erpez_tenant_id'))
        : null;
      const requestHeaders: Record<string, string> = { Authorization: `Bearer ${token}` };
      if (candidateId) {
        requestHeaders['X-Tenant-Id'] = candidateId;
      }

      const availRes = await axios.get(`${backendUrl}/api/tenant/available`, { headers: requestHeaders });
      const available: UnifiedTenantContext[] = availRes.data?.data || [];
      setAvailableTenants(available);

      // 2. Fetch active workspace context
      const contextRes = await axios.get(`${backendUrl}/api/tenant/context`, { headers: requestHeaders });
      const contextData = contextRes.data?.data;

      let resolvedTenant = contextData?.activeTenant;
      if (!resolvedTenant && available.length > 0) {
        resolvedTenant = available.find((t) => t.id === candidateId) || available[0];
      }

      if (resolvedTenant) {
        try {
          sessionStorage.setItem('erpez_candidate_tenant_id', resolvedTenant.id);
          localStorage.setItem('erpez_tenant_id', resolvedTenant.id);
        } catch {}

        setActiveTenant({
          id: resolvedTenant.id,
          externalOrgId: resolvedTenant.externalOrgId,
          name: resolvedTenant.name,
          slug: resolvedTenant.slug,
          authProvider: 'clerk',
        });
        setTenantState('resolved');
      } else {
        setActiveTenant(null);
        setTenantState('unavailable');
      }
    } catch (err: any) {
      console.error('Failed to load Clerk tenant context:', err);
      if (err?.response?.status === 403) {
        setTenantState('forbidden');
      } else {
        setTenantState('unavailable');
      }
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        fetchTenantContext();
      } else {
        setActiveTenant(null);
        setAvailableTenants([]);
        setTenantState('unavailable');
      }
    }
  }, [isLoaded, isSignedIn, organization?.id, fetchTenantContext]);

  const switchTenant = useCallback(
    async (targetTenantId: string) => {
      // 1. Verify tenantId exists in availableTenants before touching IdP
      const target = availableTenants.find((t) => t.id === targetTenantId);
      if (!target) {
        throw new Error(`Target tenant ${targetTenantId} is not in authorized available workspaces.`);
      }

      if (!target.externalOrgId) {
        throw new Error(`Target tenant ${target.name} has no associated Clerk organization.`);
      }

      // 2. Switch Clerk active organization
      if (setActive) {
        await setActive({ organization: target.externalOrgId });
      }

      // 3. Re-fetch tenant context
      await fetchTenantContext();
    },
    [availableTenants, setActive, fetchTenantContext]
  );

  const unifiedUser: UnifiedUser | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username || user.primaryEmailAddress?.emailAddress || user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      displayName: user.fullName || user.firstName || 'User',
      roles: (user.publicMetadata?.roles as string[]) || ['User'],
    };
  }, [user]);

  const workspaceMembers = useMemo(() => {
    if (!memberships?.data) return [];
    return memberships.data.map((m: any) => {
      const pub = m.publicUserData || {};
      const firstName = pub.firstName || '';
      const lastName = pub.lastName || '';
      const fullName =
        [firstName, lastName].filter(Boolean).join(' ') ||
        pub.identifier ||
        'Workspace Member';
      return {
        userId: pub.userId || '',
        email: pub.identifier || '',
        fullName,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        imageUrl: pub.imageUrl || undefined,
        role: m.role || undefined,
      };
    });
  }, [memberships?.data]);

  const authState: AuthState = !isLoaded ? 'loading' : isSignedIn ? 'authenticated' : 'unauthenticated';

  const value: UnifiedAuthContextType = {
    authState,
    tenantState,
    authReady: authState === 'authenticated',
    tenantContextReady: tenantState === 'resolved',
    user: unifiedUser,
    workspaceMembers,
    activeTenant,
    availableTenants,
    switchTenant,
    getToken: () => getToken(),
    logout: async () => {
      await signOut();
    },
    provider: 'clerk',

    // Backward compatibility fields
    isAuthenticated: Boolean(isSignedIn),
    isInitialized: isLoaded,
    token: rawToken,
    refreshToken: null,
    userName: unifiedUser?.username || null,
    email: unifiedUser?.email || null,
    firstName: user?.firstName || null,
    lastName: user?.lastName || null,
    role: unifiedUser?.roles?.[0] || null,
    roles: unifiedUser?.roles || [],
    tenantId: activeTenant?.id || null,
    isSuperAdmin: Boolean(user?.publicMetadata?.isSuperAdmin),
    activeDevUser: '',
    login: () => {
      clerk.openSignIn();
    },
    register: () => {
      clerk.openSignUp();
    },
    updateToken: async () => {
      const refreshed = await getToken({ skipCache: true });
      return Boolean(refreshed);
    },
    switchDevUser: async () => {},
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted-foreground">Initializing Clerk authentication...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <UnifiedAuthContext.Provider value={value}>
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
          <SignIn routing="hash" />
        </div>
      </UnifiedAuthContext.Provider>
    );
  }

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

export function ClerkAuthProvider({ children, publishableKey }: ClerkAuthProviderProps) {
  const key = publishableKey || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!key || key.includes('placeholder')) {
    console.warn('VITE_CLERK_PUBLISHABLE_KEY is not configured or is placeholder.');
  }

  return (
    <ClerkProvider publishableKey={key || 'pk_test_placeholder'}>
      <ClerkInnerAdapter>{children}</ClerkInnerAdapter>
    </ClerkProvider>
  );
}
