import { useUser } from "@clerk/react-router";
import { TenantOverviewSkeleton } from "./features/overview/skeleton/TenantOverviewSkeleton";
import { useTenant } from "~/providers/TenantProvider";

interface TenantCheckerProps {
    children: React.ReactNode;
    inverted?: boolean;
    fallback: React.ReactNode;
}

export default function TenantChecker({ children, inverted = false, fallback }: TenantCheckerProps) {
    const { isLoaded } = useUser();
    const { tenant, isLoading } = useTenant();

    if (!isLoaded || isLoading) {
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