import { Navigate } from "react-router";
import { useTenant } from "~/providers/TenantProvider";
import LoadingSpinner from "../LoadingSpinner";

import { Button } from "~/components/ui/button";

import NoTenantEmptyState from "./NoTenantEmptyState";

interface TenantGuardProps {
    children: React.ReactNode;
}

function TenantGuard({ children }: TenantGuardProps) {
    const { tenant: myTenant, isLoading, error, refetchWorkspaces } = useTenant();

    if (isLoading) {
        return <LoadingSpinner size="md" message="Loading interface..." />;
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