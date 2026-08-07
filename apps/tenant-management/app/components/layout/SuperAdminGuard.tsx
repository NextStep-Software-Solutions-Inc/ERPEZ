import { useUser } from "@clerk/react-router";
import Unauthorized from "./Unauthorized";

interface SuperAdminGuardProps {
    children: React.ReactNode;
}
export default function SuperAdminGuard({ children }: SuperAdminGuardProps) {
    const { user } = useUser();
    const role = user?.publicMetadata?.role;

    if (role !== "super-admin") {
        return <Unauthorized />;
    }

    return <>{children}</>;
}