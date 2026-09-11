import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { createQueryHookFromTemplate } from 'erpez-shared-lib';
import { useQueryClient } from '@tanstack/react-query';
import { getMyTenantRequest } from '~/features/tenant/handlers/getMyTenantRequest';
import type { Tenant } from '~/features/tenant/type/Tenant';
import { useAuthReady } from './AuthProvider';

const useMyTenant = createQueryHookFromTemplate(getMyTenantRequest);

export interface WorkspaceContextType {
    // Canonical Workspace Plane accessors
    workspace: Tenant | null;
    workspaces: Tenant[];
    selectWorkspace: (workspaceId: string) => void;
    userWorkspaceRoles: string[];
    isStaleSelection: boolean;

    // Backward-compatibility aliases for existing codebase
    tenant: Tenant | null;
    tenants: Tenant[];
    selectTenant: (tenantId: string) => void;

    isLoading: boolean;
    error: unknown;
    refetchWorkspaces: () => Promise<any>;
}

const TenantContext = createContext<WorkspaceContextType | undefined>(undefined);

const LOCAL_STORAGE_TENANT_KEY = "erpez_tenant_id";

function TenantProviderContent({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const { data: myTenant, isLoading, error, refetch } = useMyTenant({
        pathParams: {},
        queryParams: { pageSize: 50, pageNumber: 1 },
    });

    const workspaces: Tenant[] = useMemo(() => {
        return myTenant?.data || [];
    }, [myTenant?.data]);

    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            try {
                return localStorage.getItem(LOCAL_STORAGE_TENANT_KEY);
            } catch {
                return null;
            }
        }
        return null;
    });

    const [isStaleSelection, setIsStaleSelection] = useState(false);

    // Reconcile selectedWorkspaceId with verified accessible workspaces from backend
    useEffect(() => {
        if (isLoading || workspaces.length === 0) {
            return;
        }

        const storedId = selectedWorkspaceId;
        const exists = storedId && workspaces.some((w) => w.id === storedId);

        if (exists) {
            setIsStaleSelection(false);
        } else {
            // Stale or uninitialized localStorage: fall back to the first authorized workspace
            const fallbackWorkspace = workspaces[0];
            if (storedId && !exists) {
                setIsStaleSelection(true);
            }
            setSelectedWorkspaceId(fallbackWorkspace.id);
            try {
                localStorage.setItem(LOCAL_STORAGE_TENANT_KEY, fallbackWorkspace.id);
            } catch {
                // Ignore storage errors
            }
        }
    }, [isLoading, workspaces, selectedWorkspaceId]);

    const activeWorkspace = useMemo(() => {
        if (workspaces.length === 0) return null;
        return workspaces.find((w) => w.id === selectedWorkspaceId) || workspaces[0] || null;
    }, [workspaces, selectedWorkspaceId]);

    // Extract caller's roles inside the active workspace
    const userWorkspaceRoles: string[] = useMemo(() => {
        if (!activeWorkspace) return [];
        const member = (activeWorkspace as any).tenantMembers?.[0];
        if (!member) return [];
        if (member.roles && member.roles.length > 0) return member.roles;
        if (member.role) return [member.role];
        return [];
    }, [activeWorkspace]);

    const selectWorkspace = (workspaceId: string) => {
        const target = workspaces.find((w) => w.id === workspaceId);
        if (!target) {
            console.warn(`[Workspace Switcher] Cannot switch to unauthorized or unknown workspace: ${workspaceId}`);
            return;
        }

        setSelectedWorkspaceId(workspaceId);
        setIsStaleSelection(false);

        try {
            // localStorage is strictly client-side UX navigation preference, NEVER trusted for authorization.
            localStorage.setItem(LOCAL_STORAGE_TENANT_KEY, workspaceId);
        } catch {
            // Ignore storage errors
        }

        // Invalidate all query caches so subsequent API requests refetch using candidate X-Tenant-Id
        queryClient.invalidateQueries();
    };

    const contextValue: WorkspaceContextType = {
        workspace: activeWorkspace,
        workspaces,
        selectWorkspace,
        userWorkspaceRoles,
        isStaleSelection,

        // Aliases
        tenant: activeWorkspace,
        tenants: workspaces,
        selectTenant: selectWorkspace,

        isLoading,
        error,
        refetchWorkspaces: refetch,
    };

    return (
        <TenantContext.Provider value={contextValue}>
            {children}
        </TenantContext.Provider>
    );
}

export function TenantProvider({ children }: { children: ReactNode }) {
    const { isTokenReady } = useAuthReady();

    // Only render the content that makes the API call after token is ready
    if (!isTokenReady) {
        return (
            <TenantContext.Provider
                value={{
                    workspace: null,
                    workspaces: [],
                    selectWorkspace: () => {},
                    userWorkspaceRoles: [],
                    isStaleSelection: false,
                    tenant: null,
                    tenants: [],
                    selectTenant: () => {},
                    isLoading: true,
                    error: null,
                    refetchWorkspaces: async () => {},
                }}
            >
                {children}
            </TenantContext.Provider>
        );
    }

    return <TenantProviderContent>{children}</TenantProviderContent>;
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}

export function useWorkspace() {
    return useTenant();
}