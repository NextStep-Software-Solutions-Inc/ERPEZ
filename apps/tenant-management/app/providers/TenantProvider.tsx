import { createContext, useContext, type ReactNode } from 'react';
import { createQueryHookFromTemplate } from 'erpez-shared-lib';
import { getMyTenantRequest } from '~/features/tenant/handlers/getMyTenantRequest';
import type { Tenant } from '~/features/tenant/type/Tenant';
import { useAuthReady } from './AuthProvider';

const useMyTenant = createQueryHookFromTemplate(getMyTenantRequest);

interface TenantContextType {
    tenant: Tenant | null;
    isLoading: boolean;
    error: unknown;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

function TenantProviderContent({ children }: { children: ReactNode }) {
    const { data: myTenant, isLoading, error } = useMyTenant({
        pathParams: {},
        queryParams: {},
    });

    const tenant = myTenant?.data?.[0] || null;

    return (
        <TenantContext.Provider value={{ tenant, isLoading, error }}>
            {children}
        </TenantContext.Provider>
    );
}

export function TenantProvider({ children }: { children: ReactNode }) {
    const { isTokenReady } = useAuthReady();

    // Only render the content that makes the API call after token is ready
    if (!isTokenReady) {
        return (
            <TenantContext.Provider value={{ tenant: null, isLoading: true, error: null }}>
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