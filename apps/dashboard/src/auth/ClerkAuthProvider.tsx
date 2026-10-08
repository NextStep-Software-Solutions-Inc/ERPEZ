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
import { fetchMyOperationalRoles } from '@/services/api/operationalRoles';
import { getTenantApiUrl } from '@/config/env';
import axios from 'axios';

interface ClerkAuthProviderProps {
  children: React.ReactNode;
  publishableKey?: string;
}

const KNOWN_WORKSPACES_KEY = 'erpez_known_workspaces';

function getStoredKnownWorkspaces(): UnifiedTenantContext[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KNOWN_WORKSPACES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveKnownWorkspaces(workspaces: UnifiedTenantContext[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KNOWN_WORKSPACES_KEY, JSON.stringify(workspaces));
  } catch {}
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
      const urlParams = new URLSearchParams(window.location.search);
      const urlTenant = urlParams.get('tenantId');
      if (urlTenant) return urlTenant;
      return (
        sessionStorage.getItem('erpez_candidate_tenant_id') ||
        localStorage.getItem('erpez_tenant_id') ||
        null
      );
    }
    return null;
  });
  const [loadTimeout, setLoadTimeout] = useState(false);
  const hasAutoActivatedRef = useRef(false);

  useEffect(() => {
    if (isLoaded) return;
    const timer = setTimeout(() => {
      setLoadTimeout(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

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
        const token = await getToken();
        if (token) setRawToken(token);
        const tenants = await fetchMyTenants(token);
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
  }, [isSignedIn, getToken]);

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

      if (targetMembership?.organization?.id) {
        setActive({ organization: targetMembership.organization.id }).catch((err) => {
          console.error('Failed to auto-activate Clerk organization:', err);
        });
      }
    }
  }, [isLoaded, isSignedIn, isOrgListLoaded, Boolean(organization), userMemberships?.data?.length, setActive]);

  // Derive available workspaces by merging TenantManagement.Api workspaces with stored workspaces, Clerk organizations, and candidate storage
  const availableTenants: UnifiedTenantContext[] = useMemo(() => {
    const list: UnifiedTenantContext[] = [];
    const seenIds = new Set<string>();

    const addWorkspace = (w: UnifiedTenantContext) => {
      if (!w || !w.id) return;
      if (!seenIds.has(w.id)) {
        seenIds.add(w.id);
        list.push(w);
      }
    };

    // 1. Authoritative ERPEZ workspaces from TenantManagement.Api (tmTenants)
    for (const t of tmTenants) {
      addWorkspace({
        id: t.id,
        externalOrgId: t.externalOrgId || t.id,
        name: t.name,
        slug: t.slug || undefined,
        authProvider: 'clerk' as const,
      });
    }

    // 2. Previously remembered workspaces from persistent localStorage
    const savedWorkspaces = getStoredKnownWorkspaces();
    for (const w of savedWorkspaces) {
      addWorkspace(w);
    }

    // 3. Candidate tenant from URL / storage (e.g. Pax Silica Inc. opened from tenant management)
    const candidateId = typeof window !== 'undefined'
      ? (sessionStorage.getItem('erpez_candidate_tenant_id') || localStorage.getItem('erpez_tenant_id'))
      : null;
    const candidateName = typeof window !== 'undefined'
      ? (sessionStorage.getItem('erpez_tenant_name') || localStorage.getItem('erpez_tenant_name'))
      : null;

    if (candidateId) {
      addWorkspace({
        id: candidateId,
        externalOrgId: candidateId,
        name: candidateName || (candidateId.includes('01a115a3') ? 'Pax Silica Inc.' : 'Workspace'),
        authProvider: 'clerk' as const,
      });
    }

    // 4. Add any Clerk organizations not already represented
    const clerkOrgs = userMemberships?.data || [];
    for (const m of clerkOrgs) {
      const clerkOrg = m.organization;
      const alreadyAdded = list.some(
        (t) =>
          t.externalOrgId === clerkOrg.id ||
          t.id === clerkOrg.id ||
          t.name.toLowerCase() === clerkOrg.name.toLowerCase()
      );
      if (!alreadyAdded) {
        addWorkspace({
          id: clerkOrg.id,
          externalOrgId: clerkOrg.id,
          name: clerkOrg.name,
          slug: clerkOrg.slug || undefined,
          authProvider: 'clerk' as const,
        });
      }
    }

    // 5. Fallback to active organization if list is empty
    if (list.length === 0 && organization) {
      addWorkspace({
        id: organization.id,
        externalOrgId: organization.id,
        name: organization.name,
        slug: organization.slug || undefined,
        authProvider: 'clerk' as const,
      });
    }

    // Persist discovered workspaces so they survive switches across the session
    if (list.length > 0) {
      saveKnownWorkspaces(list);
    }

    return list;
  }, [tmTenants, userMemberships?.data, organization]);

  // Derive active workspace directly from requested tenant, Clerk organization, or TenantManagement.Api
  const activeTenant: UnifiedTenantContext | null = useMemo(() => {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const storedCandidate = typeof window !== 'undefined'
      ? sessionStorage.getItem('erpez_candidate_tenant_id') || localStorage.getItem('erpez_tenant_id')
      : null;
    const targetTenantId = selectedTenantId || (storedCandidate && guidRegex.test(storedCandidate) ? storedCandidate : null);

    // 1. If a specific tenant is targeted/selected, prioritize matching from availableTenants or tmTenants
    if (targetTenantId) {
      const match =
        availableTenants.find((t) => t.id === targetTenantId || t.externalOrgId === targetTenantId) ||
        tmTenants.find((t) => t.id === targetTenantId || t.externalOrgId === targetTenantId);

      if (match) {
        return {
          id: match.id,
          externalOrgId: (match as any).externalOrgId || match.id,
          name: match.name,
          slug: match.slug || undefined,
          authProvider: 'clerk',
        };
      }
    }

    // 2. If Clerk has an active organization, match it
    if (organization) {
      const matched = tmTenants.find(
        (t) =>
          t.id === organization.id ||
          t.externalOrgId === organization.id ||
          t.name.toLowerCase() === organization.name.toLowerCase() ||
          (t.slug && organization.slug && t.slug.toLowerCase() === organization.slug.toLowerCase())
      );

      const devNextJumpId = organization.name.toLowerCase().includes('nextjump')
        ? '01a0d69d-924b-762c-a774-523a30544619'
        : null;

      const resolvedId = matched?.id || devNextJumpId || organization.id;

      return {
        id: resolvedId,
        externalOrgId: organization.id,
        name: matched?.name || organization.name,
        slug: organization.slug || undefined,
        authProvider: 'clerk',
      };
    }

    // 3. Fallback to first available workspace
    if (availableTenants.length > 0) {
      return availableTenants[0];
    }

    return null;
  }, [selectedTenantId, availableTenants, tmTenants, organization]);

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

      // Update bridge immediately
      setTenantProvider(() => target.id);

      try {
        const members = await fetchTenantMembers();
        setTmMembers(members);
      } catch (err) {
        console.warn('Failed to refresh tenant members after switch:', err);
      }
    },
    [availableTenants, setActive]
  );

  const userEmail = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() || '';

  // Synchronize authenticated user email, name and active role to storage for backend identification
  useEffect(() => {
    if (userEmail && typeof window !== 'undefined') {
      try {
        localStorage.setItem('erpez_user_email', userEmail);
        sessionStorage.setItem('erpez_user_email', userEmail);
        const name = user?.fullName || user?.firstName || user?.username || '';
        if (name) {
          localStorage.setItem('erpez_user_name', name);
          sessionStorage.setItem('erpez_user_name', name);
        }
      } catch {}
    }
  }, [userEmail, user?.fullName, user?.firstName, user?.username]);

  const configuredAdminEmails = (
    (import.meta.env.VITE_PLATFORM_ADMIN_EMAILS as string | undefined) ||
    'jeanmaureal@gmail.com,superadmin@erpez.dev'
  )
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
  const isEmailAdmin = Boolean(userEmail && configuredAdminEmails.includes(userEmail));
  const isPlatformAdmin = Boolean(
    isEmailAdmin ||
    user?.publicMetadata?.isSuperAdmin ||
    user?.publicMetadata?.role === 'Platform Administrator' ||
    user?.publicMetadata?.role === 'super-admin'
  );

  const isTenantAdmin = useMemo(() => {
    if (!activeTenant) return false;

    // 1. Check TenantManagement members for active tenant
    const tmSelf = tmMembers.find(
      (m) =>
        (m.userId && user?.id && m.userId.toLowerCase() === user.id.toLowerCase()) ||
        (m.email && userEmail && m.email.toLowerCase() === userEmail)
    );
    if (tmSelf) {
      const roleUpper = (tmSelf.role || '').toUpperCase();
      if (
        roleUpper === 'TENANTADMIN' ||
        roleUpper === 'TENANT ADMINISTRATOR' ||
        roleUpper === 'DASHBOARD SYSTEM ADMIN' ||
        tmSelf.roles?.some((r: string) => {
          const u = r.toUpperCase();
          return u === 'TENANTADMIN' || u === 'TENANT ADMINISTRATOR' || u === 'DASHBOARD SYSTEM ADMIN';
        })
      ) {
        return true;
      }
    }

    // 2. Check Clerk Organization membership for active organization
    const activeOrgId = organization?.id || activeTenant?.externalOrgId || activeTenant?.id;
    const membership = userMemberships?.data?.find((m: any) => m.organization?.id === activeOrgId);
    if (membership?.role === 'org:admin' || membership?.role === 'admin') return true;
    if (organization && (organization as any).membership?.role === 'org:admin') return true;

    return false;
  }, [user?.id, userEmail, activeTenant, tmMembers, organization, userMemberships?.data]);

  const [assignedOperationalRoles, setAssignedOperationalRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!isSignedIn || !user) {
      setAssignedOperationalRoles([]);
      return;
    }

    let isMounted = true;
    fetchMyOperationalRoles()
      .then((roles) => {
        if (isMounted && roles && roles.length > 0) {
          setAssignedOperationalRoles(roles);
        }
      })
      .catch((err) => {
        console.warn('Could not load user operational roles:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isSignedIn, user?.id, activeTenant?.id]);

  // Workspace-scoped roles strictly granted within activeTenant
  const workspaceRoles = useMemo(() => {
    const list: string[] = [];

    // Tenant governance role if user is explicitly an authorized tenant admin of this workspace
    if (isTenantAdmin) {
      list.push('Tenant Administrator');
    }

    // Operational roles returned from active tenant database (e.g. Planning Officer, Inventory Manager, etc.)
    if (assignedOperationalRoles.length > 0) {
      list.push(...assignedOperationalRoles);
    }

    // Fallback if user has no assigned operational roles and is not a tenant admin
    if (list.length === 0) {
      list.push('Employee / Viewer');
    }

    return Array.from(new Set(list));
  }, [isTenantAdmin, assignedOperationalRoles]);

  // Global-scoped roles (independent of any specific workspace)
  const globalRoles = useMemo(() => {
    if (isPlatformAdmin) {
      return ['Platform Administrator'];
    }
    return [];
  }, [isPlatformAdmin]);

  // Combined roles available to the user
  const derivedRoles = useMemo(() => {
    return Array.from(new Set([...workspaceRoles, ...globalRoles]));
  }, [workspaceRoles, globalRoles]);

  const [activeRole, setActiveRole] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('erpez_active_role');
      if (saved) return saved;
    }
    return isPlatformAdmin ? 'Platform Administrator' : isTenantAdmin ? 'Tenant Administrator' : 'Employee / Viewer';
  });

  // Automatically validate and sync activeRole to available roles in the current tenant context
  useEffect(() => {
    const allAvailable = [...workspaceRoles, ...globalRoles];
    if (allAvailable.length === 0) return;

    // Check if the current activeRole is valid in the current context
    const isValid = allAvailable.includes(activeRole);
    if (!isValid) {
      // Prioritize primary operational workspace role if available (e.g. Planning Officer)
      const primaryOperational = assignedOperationalRoles.find((r) => r !== 'Employee / Viewer');
      const nextRole =
        primaryOperational ||
        workspaceRoles[0] ||
        (isPlatformAdmin ? 'Platform Administrator' : 'Employee / Viewer');

      setActiveRole(nextRole);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('erpez_active_role', nextRole);
        localStorage.setItem('erpez_active_role', nextRole);
      }
    }
  }, [workspaceRoles, globalRoles, activeRole, assignedOperationalRoles, isPlatformAdmin]);

  const switchActiveRole = useCallback((newRole: string) => {
    setActiveRole(newRole);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('erpez_active_role', newRole);
      localStorage.setItem('erpez_active_role', newRole);
    }
  }, []);

  useEffect(() => {
    if (activeRole && typeof window !== 'undefined') {
      sessionStorage.setItem('erpez_active_role', activeRole);
      localStorage.setItem('erpez_active_role', activeRole);
    }
  }, [activeRole]);

  const unifiedUser: UnifiedUser | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username || user.primaryEmailAddress?.emailAddress || user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      displayName: user.fullName || user.firstName || 'User',
      roles: derivedRoles,
    };
  }, [user, derivedRoles]);

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

        const apiUrl = getTenantApiUrl();
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
    role: activeRole,
    roles: unifiedUser?.roles || [],
    activeRole,
    switchActiveRole,
    tenantId: activeTenant?.id || null,
    isSuperAdmin: activeRole === 'Platform Administrator',
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
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-sm font-medium text-foreground">Initializing Clerk authentication...</p>
          {loadTimeout && (
            <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300 text-left space-y-2 animate-in fade-in duration-300">
              <p className="font-semibold text-sm">Authentication is taking longer than usual</p>
              <p className="text-muted-foreground">The application is waiting for Clerk&apos;s authentication service to initialize:</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>Check DevTools Console (<kbd className="px-1 py-0.5 rounded bg-muted">F12</kbd>) for network blocks or CORS errors.</li>
                <li>Disable adblockers / Brave Shields for <code className="px-1 rounded bg-muted">localhost</code> and <code className="px-1 rounded bg-muted">*.clerk.accounts.dev</code>.</li>
                <li>Verify your internet connection to Clerk&apos;s account portal.</li>
              </ul>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Reload Page
                </button>
              </div>
            </div>
          )}
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
