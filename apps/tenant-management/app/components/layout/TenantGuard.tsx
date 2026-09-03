import { Navigate } from "react-router";
import { useTenant } from "~/providers/TenantProvider";
import LoadingSpinner from "../LoadingSpinner";

interface TenantGuardProps {
    children: React.ReactNode;
}

function TenantGuard({ children }: TenantGuardProps) {
    const { tenant: myTenant, isLoading, error } = useTenant();

    if (isLoading) {
        return <LoadingSpinner size="md" message="Loading interface..." />;
    }

    if (!myTenant || error) {
        return <Navigate to="/register-tenant" replace />;
    }

    return children;
}

export default TenantGuard;