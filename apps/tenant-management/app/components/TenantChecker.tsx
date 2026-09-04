import { useKeycloak } from "~/providers/KeycloakProvider";
import { TenantOverviewSkeleton } from "./features/overview/skeleton/TenantOverviewSkeleton";
import { useTenant } from "~/providers/TenantProvider";

interface TenantCheckerProps {
    children: React.ReactNode;
    inverted?: boolean;
    fallback: React.ReactNode;
}

export default function TenantChecker({ children, inverted = false, fallback }: TenantCheckerProps) {
    const { isInitialized } = useKeycloak();
    const { tenant, isLoading } = useTenant();

    if (!isInitialized || isLoading) {
        return (
            <div className="p-6">
                <TenantOverviewSkeleton />
            </div>
        );
    }

    const tenantExists = !!tenant;
    const shouldShowChildren = inverted ? !tenantExists : tenantExists;

    return shouldShowChildren ? children : fallback;
}