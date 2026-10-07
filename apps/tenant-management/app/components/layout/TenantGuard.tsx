import { useEffect } from "react";
import { useTenant } from "~/providers/TenantProvider";
import { useClerkAuth } from "~/providers/ClerkAuthProvider";
import LoadingSpinner from "../LoadingSpinner";
import { Button } from "~/components/ui/button";
import NoTenantEmptyState from "./NoTenantEmptyState";

interface TenantGuardProps {
    children: React.ReactNode;
}

function TenantGuard({ children }: TenantGuardProps) {
    const { tenant: myTenant, isLoading, error, refetchWorkspaces, userWorkspaceRoles, isSpectating } = useTenant();
    const { isSuperAdmin } = useClerkAuth();

    const isTenantAdmin = isSuperAdmin || isSpectating || (userWorkspaceRoles || []).some(r =>
        r.toLowerCase().includes('admin') || r.toLowerCase().includes('owner')
    );

    useEffect(() => {
        if (!isLoading && myTenant && !isTenantAdmin) {
            const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000';
            window.location.href = `${dashboardUrl}/v2/overview`;
        }
    }, [isLoading, myTenant, isTenantAdmin]);

    if (isLoading) {
        return <LoadingSpinner size="md" message="Loading interface..." />;
    }

    if (!isTenantAdmin && myTenant) {
        return <LoadingSpinner size="md" message="Redirecting to ERPEZ Dashboard..." />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
                <div className="text-destructive font-semibold text-lg">Unable to load workspace</div>
                <p className="text-sm text-muted-foreground max-w-md">
                    There was an issue verifying your workspace access. Please check your connection or retry.
                </p>
                <Button onClick={() => refetchWorkspaces()} variant="outline">
                    Retry
                </Button>
            </div>
        );
    }

    if (!myTenant) {
        return <NoTenantEmptyState />;
    }

    return children;
}

export default TenantGuard;