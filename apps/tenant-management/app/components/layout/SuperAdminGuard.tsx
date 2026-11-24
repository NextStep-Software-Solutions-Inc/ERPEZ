import { useClerkAuth } from "~/providers/ClerkAuthProvider";
import Unauthorized from "./Unauthorized";

interface SuperAdminGuardProps {
    children: React.ReactNode;
}

export default function SuperAdminGuard({ children }: SuperAdminGuardProps) {
    const { isSuperAdmin } = useClerkAuth();

    if (!isSuperAdmin) {
        return <Unauthorized />;
    }

    return <>{children}</>;
}