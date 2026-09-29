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

    // Spectator Mode
    isSpectating: boolean;
    spectatingTenant: { id: string; name: string } | null;
    startSpectating: (tenant: { id: string; name: string }) => void;
    stopSpectating: () => void;

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
const LOCAL_STORAGE_SPECTATING_KEY = "erpez_spectating_tenant";

function TenantProviderContent({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const { data: myTenant, isLoading, error, refetch } = useMyTenant({
        pathParams: {},
        queryParams: { pageSize: 50, pageNumber: 1 },
    });

    const workspaces: Tenant[] = useMemo(() => {
        return myTenant?.data || [];
    }, [myTenant?.data]);

    const [spectatingTenant, setSpectatingTenant] = useState<{ id: string; name: string } | null>(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(LOCAL_STORAGE_SPECTATING_KEY);
                return stored ? JSON.parse(stored) : null;
            } catch {
                return null;
            }
        }
        return null;
    });

    const isSpectating = !!spectatingTenant;

    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            try {
                if (spectatingTenant?.id) {
                    return spectatingTenant.id;
                }
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
        if (spectatingTenant) {
            setSelectedWorkspaceId(spectatingTenant.id);
            setIsStaleSelection(false);
            return;
        }

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
    }, [isLoading, workspaces, selectedWorkspaceId, spectatingTenant]);

    const activeWorkspace = useMemo(() => {
        if (spectatingTenant) {
            const found = workspaces.find((w) => w.id === spectatingTenant.id);
            if (found) return found;
            return {
                id: spectatingTenant.id,
                name: spectatingTenant.name,
                isDeleted: false,
                isDisabled: false,
            } as unknown as Tenant;
        }
        if (workspaces.length === 0) return null;
        return workspaces.find((w) => w.id === selectedWorkspaceId) || workspaces[0] || null;
    }, [workspaces, selectedWorkspaceId, spectatingTenant]);

    // Extract caller's roles inside the active workspace
    const userWorkspaceRoles: string[] = useMemo(() => {
        if (spectatingTenant) {
            return ['Platform Administrator'];
        }
        if (!activeWorkspace) return [];
        const member = (activeWorkspace as any).tenantMembers?.[0];
        if (!member) return [];
        if (member.roles && member.roles.length > 0) return member.roles;
        if (member.role) return [member.role];
        return [];
    }, [activeWorkspace, spectatingTenant]);

    const selectWorkspace = (workspaceId: string) => {
        const target = workspaces.find((w) => w.id === workspaceId);
        if (!target && (!spectatingTenant || spectatingTenant.id !== workspaceId)) {
            console.warn(`[Workspace Switcher] Cannot switch to unauthorized or unknown workspace: ${workspaceId}`);
            return;
        }

        setSelectedWorkspaceId(workspaceId);
        setIsStaleSelection(false);

        try {
            localStorage.setItem(LOCAL_STORAGE_TENANT_KEY, workspaceId);
        } catch {
            // Ignore storage errors
        }

        queryClient.invalidateQueries();
    };

    const startSpectating = (tenantInfo: { id: string; name: string }) => {
        setSpectatingTenant(tenantInfo);
        setSelectedWorkspaceId(tenantInfo.id);
        setIsStaleSelection(false);
        try {
            localStorage.setItem(LOCAL_STORAGE_SPECTATING_KEY, JSON.stringify(tenantInfo));
            localStorage.setItem(LOCAL_STORAGE_TENANT_KEY, tenantInfo.id);
        } catch {
            // Ignore storage errors
        }
        queryClient.invalidateQueries();
    };

    const stopSpectating = () => {
        setSpectatingTenant(null);
        try {
            localStorage.removeItem(LOCAL_STORAGE_SPECTATING_KEY);
        } catch {
            // Ignore storage errors
        }

        const fallback = workspaces[0];
        if (fallback) {
            setSelectedWorkspaceId(fallback.id);
            try {
                localStorage.setItem(LOCAL_STORAGE_TENANT_KEY, fallback.id);
            } catch {
                // Ignore storage errors
            }
        }
        queryClient.invalidateQueries();
    };

    const contextValue: WorkspaceContextType = {
        workspace: activeWorkspace,
        workspaces,
        selectWorkspace,
        userWorkspaceRoles,
        isStaleSelection,

        isSpectating,
        spectatingTenant,
        startSpectating,
        stopSpectating,

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
                    isSpectating: false,
                    spectatingTenant: null,
                    startSpectating: () => {},
                    stopSpectating: () => {},
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

const defaultFallbackContext: WorkspaceContextType = {
    workspace: null,
    workspaces: [],
    selectWorkspace: () => {},
    userWorkspaceRoles: [],
    isStaleSelection: false,
    isSpectating: false,
    spectatingTenant: null,
    startSpectating: () => {},
    stopSpectating: () => {},
    tenant: null,
    tenants: [],
    selectTenant: () => {},
    isLoading: false,
    error: null,
    refetchWorkspaces: async () => {},
};

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        return defaultFallbackContext;
    }
    return context;
}

export function useWorkspace() {
    return useTenant();
}