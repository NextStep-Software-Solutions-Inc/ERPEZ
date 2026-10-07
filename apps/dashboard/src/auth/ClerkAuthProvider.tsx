import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  WorkspaceMemberInfo,
} from './types';
import { setTokenProvider, setTenantProvider, setRefreshProvider, getAuthToken } from './authBridge';
import {
  fetchMyTenants,
  fetchTenantMembers,
  inviteTenantMember,
  type TenantDto,
  type TenantMemberDto,
} from '@/services/api/tenantMembers';
import axios from 'axios';

interface ClerkAuthProviderProps {
  children: React.ReactNode;
  publishableKey?: string;
}

function ClerkInnerAdapter({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth();
  const { user } = useUser();
  const { organization, memberships, invitations } = useOrganization({
    memberships: {
      infinite: true,
    },
    invitations: {
      infinite: true,
    },
  });
  const { setActive, userMemberships, isLoaded: isOrgListLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const clerk = useClerk();

  const [rawToken, setRawToken] = useState<string | null>(null);
  const [tmTenants, setTmTenants] = useState<TenantDto[]>([]);
  const [tmMembers, setTmMembers] = useState<TenantMemberDto[]>([]);
  const [isTmLoading, setIsTmLoading] = useState<boolean>(true);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return (
        sessionStorage.getItem('erpez_candidate_tenant_id') ||
        localStorage.getItem('erpez_tenant_id') ||
        null
      );
    }
    return null;
  });
  const hasAutoActivatedRef = useRef(false);

  // Fetch tenants and members from TenantManagement.Api upon signing in
  useEffect(() => {
    if (!isSignedIn) {
      setTmTenants([]);
      setTmMembers([]);
      setIsTmLoading(false);
      return;
    }

    let isMounted = true;
    setIsTmLoading(true);

    const loadTenantData = async () => {
      try {
        const tenants = await fetchMyTenants();
        if (!isMounted) return;
        setTmTenants(tenants);

        const activeId =
          selectedTenantId ||
          (typeof window !== 'undefined'
            ? sessionStorage.getItem('erpez_candidate_tenant_id') || localStorage.getItem('erpez_tenant_id')
            : null) ||
          (tenants.length > 0 ? tenants[0].id : null);

        if (activeId && typeof window !== 'undefined') {
          sessionStorage.setItem('erpez_candidate_tenant_id', activeId);
          localStorage.setItem('erpez_tenant_id', activeId);
        }

        const members = await fetchTenantMembers();
        if (!isMounted) return;
        setTmMembers(members);
      } catch (err) {
        console.warn('Failed to load TenantManagement data:', err);
      } finally {
        if (isMounted) setIsTmLoading(false);
      }
    };

    loadTenantData();

    return () => {
      isMounted = false;
    };
  }, [isSignedIn]);

  // Auto-activate Clerk organization once if none is active in session
  useEffect(() => {
    if (hasAutoActivatedRef.current) return;
    if (
      isLoaded &&
      isSignedIn &&
      isOrgListLoaded &&
      !organization &&
      userMemberships?.data &&
      userMemberships.data.length > 0 &&
      setActive
    ) {
      hasAutoActivatedRef.current = true;
      const savedExternalId = typeof window !== 'undefined'
        ? (sessionStorage.getItem('erpez_external_org_id') || localStorage.getItem('erpez_external_org_id'))
        : null;

      const targetMembership = savedExternalId
        ? userMemberships.data.find((m: any) => m.organization?.id === savedExternalId)
        : null;

      const orgToActivate = targetMembership?.organization || userMemberships.data[0]?.organization;
      if (orgToActivate?.id) {
        setActive({ organization: orgToActivate.id }).catch((err) => {
          console.error('Failed to auto-activate Clerk organization:', err);
        });
      }
    }
  }, [isLoaded, isSignedIn, isOrgListLoaded, Boolean(organization), userMemberships?.data?.length, setActive]);

  // Derive available workspaces directly from Clerk memberships or TenantManagement.Api (memoized)
  const availableTenants: UnifiedTenantContext[] = useMemo(() => {
    const list = userMemberships?.data;
    if (list && list.length > 0) {
      return list.map((m: any) => ({
        id: m.organization.id,
        externalOrgId: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug || undefined,
        authProvider: 'clerk' as const,
      }));
    }
    if (organization) {
      return [
        {
          id: organization.id,
          externalOrgId: organization.id,
          name: organization.name,
          slug: organization.slug || undefined,
          authProvider: 'clerk' as const,
        },
      ];
    }
    if (tmTenants.length > 0) {
      return tmTenants.map((t) => ({
        id: t.id,
        externalOrgId: t.id,
        name: t.name,
        slug: t.slug,
        authProvider: 'clerk' as const,
      }));
    }
    return [];
  }, [userMemberships?.data, organization?.id, organization?.name, organization?.slug, tmTenants]);

  // Derive active workspace directly from active Clerk organization or TenantManagement.Api
  const activeTenant: UnifiedTenantContext | null = useMemo(() => {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (organization) {
      const matched = tmTenants.find(
        (t) =>
          t.id === organization.id ||
          t.externalOrgId === organization.id ||
          t.name.toLowerCase() === organization.name.toLowerCase() ||
          (t.slug && organization.slug && t.slug.toLowerCase() === organization.slug.toLowerCase())
      );

      const storedId = typeof window !== 'undefined'
        ? sessionStorage.getItem('erpez_candidate_tenant_id') || localStorage.getItem('erpez_tenant_id')
        : null;
      const validStoredId = storedId && guidRegex.test(storedId) ? storedId : null;

      // In development fallback, if NextJump Solutions is the active Clerk organization, use its seeded tenant GUID
      const devNextJumpId = organization.name.toLowerCase().includes('nextjump')
        ? '01a0d69d-924b-762c-a774-523a30544619'
        : null;

      const resolvedId = matched?.id || validStoredId || devNextJumpId || organization.id;

      return {
        id: resolvedId,
        externalOrgId: organization.id,
        name: matched?.name || organization.name,
        slug: organization.slug || undefined,
        authProvider: 'clerk',
      };
    }
    if (availableTenants.length > 0) {
      if (selectedTenantId) {
        const found = availableTenants.find(
          (t) => t.id === selectedTenantId || t.externalOrgId === selectedTenantId
        );
        if (found) return found;
      }
      return availableTenants[0];
    }
    return null;
  }, [organization?.id, organization?.name, organization?.slug, availableTenants, selectedTenantId, tmTenants]);

  // Derive tenantState cleanly from Clerk & TenantManagement loading states
  const tenantState: TenantState = useMemo(() => {
    if (!isLoaded || !isOrgListLoaded) return 'loading';
    if (!isSignedIn) return 'unavailable';
    if (activeTenant) return 'resolved';
    if (isTmLoading) return 'loading';
    if (availableTenants.length === 0) return 'unavailable';
    return 'loading';
  }, [isLoaded, isOrgListLoaded, isSignedIn, activeTenant, isTmLoading, availableTenants.length]);

  // Save active organization to storage on change
  useEffect(() => {
    if (activeTenant?.id) {
      try {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (activeTenant.externalOrgId) {
          sessionStorage.setItem('erpez_external_org_id', activeTenant.externalOrgId);
          localStorage.setItem('erpez_external_org_id', activeTenant.externalOrgId);
        }
        if (guidRegex.test(activeTenant.id)) {
          sessionStorage.setItem('erpez_candidate_tenant_id', activeTenant.id);
          localStorage.setItem('erpez_tenant_id', activeTenant.id);
        }
        sessionStorage.setItem('erpez_tenant_name', activeTenant.name);
        localStorage.setItem('erpez_tenant_name', activeTenant.name);
      } catch {}
    }
  }, [activeTenant]);

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
  }, [getToken, activeTenant?.id]);

  // Eagerly set raw token when signed in
  useEffect(() => {
    if (isSignedIn) {
      getToken().then((token) => {
        if (token) setRawToken(token);
      });
    }
  }, [isSignedIn, getToken]);

  const switchTenant = useCallback(
    async (targetTenantId: string) => {
      const target = availableTenants.find(
        (t) => t.id === targetTenantId || t.externalOrgId === targetTenantId
      );
      if (!target) {
        throw new Error(`Target workspace ${targetTenantId} is not in authorized available workspaces.`);
      }

      const externalOrgId = target.externalOrgId || target.id;
      if (setActive && externalOrgId.startsWith('org_')) {
        await setActive({ organization: externalOrgId });
      }
      setSelectedTenantId(target.id);
      try {
        sessionStorage.setItem('erpez_external_org_id', externalOrgId);
        localStorage.setItem('erpez_external_org_id', externalOrgId);
        sessionStorage.setItem('erpez_candidate_tenant_id', target.id);
        localStorage.setItem('erpez_tenant_id', target.id);
        sessionStorage.setItem('erpez_tenant_name', target.name);
        localStorage.setItem('erpez_tenant_name', target.name);
      } catch {}

      try {
        const members = await fetchTenantMembers();
        setTmMembers(members);
      } catch (err) {
        console.warn('Failed to refresh tenant members after switch:', err);
      }
    },
    [availableTenants, setActive]
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
    const list: WorkspaceMemberInfo[] = [];

    if (memberships?.data && memberships.data.length > 0) {
      for (const m of memberships.data) {
        const pub = (m as any).publicUserData || {};
        const firstName = pub.firstName || '';
        const lastName = pub.lastName || '';
        const fullName =
          [firstName, lastName].filter(Boolean).join(' ') ||
          pub.identifier ||
          'Workspace Member';
        list.push({
          userId: pub.userId || '',
          email: pub.identifier || '',
          fullName,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          imageUrl: pub.imageUrl || undefined,
          role: (m as any).role || undefined,
        });
      }
    }

    // Merge in members from TenantManagement.Api
    for (const tm of tmMembers) {
      const userId = tm.userId || tm.externalIdentityId || tm.id;
      const firstName = tm.firstName || '';
      const lastName = tm.lastName || '';
      const fullName =
        tm.fullName ||
        [firstName, lastName].filter(Boolean).join(' ') ||
        tm.email ||
        'Workspace Member';

      const existingIndex = list.findIndex(
        (m) =>
          (m.userId && userId && m.userId.toLowerCase() === userId.toLowerCase()) ||
          (m.email && tm.email && m.email.toLowerCase() === tm.email.toLowerCase())
      );

      const memberItem: WorkspaceMemberInfo = {
        userId,
        email: tm.email || '',
        fullName,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        imageUrl: undefined,
        role: tm.role || (tm.roles && tm.roles[0]) || 'TenantMember',
      };

      if (existingIndex >= 0) {
        list[existingIndex] = {
          ...list[existingIndex],
          ...memberItem,
          fullName:
            memberItem.fullName && memberItem.fullName !== 'Workspace Member'
              ? memberItem.fullName
              : list[existingIndex].fullName,
          email: memberItem.email || list[existingIndex].email,
        };
      } else {
        list.push(memberItem);
      }
    }

    return list;
  }, [memberships?.data, tmMembers]);

  const workspaceInvitations = useMemo(() => {
    if (invitations?.data && invitations.data.length > 0) {
      return invitations.data.map((inv: any) => ({
        id: inv.id,
        email: inv.emailAddress || '',
        role: inv.role === 'org:admin' ? 'Workspace Admin' : 'Workspace Member',
        status: inv.status || 'pending',
        createdAt: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : undefined,
      }));
    }
    return tmMembers
      .filter((tm) => tm.status === 'Invited' || tm.status === 'Pending')
      .map((tm) => ({
        id: tm.id,
        email: tm.email || '',
        role: tm.role === 'TenantAdmin' ? 'Workspace Admin' : 'Workspace Member',
        status: tm.status?.toLowerCase() || 'pending',
        createdAt: undefined,
      }));
  }, [invitations?.data, tmMembers]);

  const inviteWorkspaceMember = useCallback(
    async (email: string, role: string = 'org:member') => {
      let activeOrg = organization;
      if (!activeOrg && userMemberships?.data && userMemberships.data.length > 0) {
        const fallbackOrg = userMemberships.data[0].organization;
        if (setActive) {
          await setActive({ organization: fallbackOrg.id });
        }
        activeOrg = fallbackOrg as any;
      }

      if (activeOrg) {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/v2/overview` : undefined;
        await activeOrg.inviteMember({
          emailAddress: email.trim().toLowerCase(),
          role: role as any,
          redirectUrl,
        } as any);
        if (invitations?.revalidate) {
          await invitations.revalidate();
        }
        return;
      }

      // Otherwise invite via TenantManagement.Api
      await inviteTenantMember({
        email: email.trim().toLowerCase(),
      });

      try {
        const updatedMembers = await fetchTenantMembers();
        setTmMembers(updatedMembers);
      } catch (err) {
        console.warn('Failed to refresh members after invite:', err);
      }
    },
    [organization, userMemberships?.data, setActive, invitations]
  );

  const revokeWorkspaceInvitation = useCallback(
    async (invitationId: string) => {
      if (invitations?.data) {
        const inv = invitations.data.find((i: any) => i.id === invitationId);
        if (inv && typeof inv.revoke === 'function') {
          await inv.revoke();
          if (invitations.revalidate) {
            await invitations.revalidate();
          }
          return;
        }
      }

      // Fallback to TenantManagement.Api revoke
      try {
        const token = await getAuthToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const candidateId = typeof window !== 'undefined'
          ? sessionStorage.getItem('erpez_candidate_tenant_id') || localStorage.getItem('erpez_tenant_id')
          : null;
        if (candidateId) headers['X-Tenant-Id'] = candidateId;

        const apiUrl = import.meta.env.VITE_TENANT_API_URL || 'http://localhost:5246';
        await axios.post(`${apiUrl}/tenant-members/${invitationId}/invitation/revoke`, {}, { headers });
        const updated = await fetchTenantMembers();
        setTmMembers(updated);
      } catch (e) {
        console.warn('Failed to revoke tenant invitation:', e);
      }
    },
    [invitations]
  );

  const authState: AuthState = !isLoaded ? 'loading' : isSignedIn ? 'authenticated' : 'unauthenticated';

  const value: UnifiedAuthContextType = {
    authState,
    tenantState,
    authReady: authState === 'authenticated',
    tenantContextReady: tenantState === 'resolved',
    user: unifiedUser,
    workspaceMembers,
    workspaceInvitations,
    inviteWorkspaceMember,
    revokeWorkspaceInvitation,
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
