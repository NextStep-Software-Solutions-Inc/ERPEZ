import { useKeycloak } from "~/providers/KeycloakProvider";
import Unauthorized from "./Unauthorized";

interface SuperAdminGuardProps {
    children: React.ReactNode;
}

export default function SuperAdminGuard({ children }: SuperAdminGuardProps) {
    const { isSuperAdmin } = useKeycloak();

    if (!isSuperAdmin) {
        return <Unauthorized />;
    }

    return <>{children}</>;
}