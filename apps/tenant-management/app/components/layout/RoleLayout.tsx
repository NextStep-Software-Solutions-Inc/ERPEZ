import { useKeycloak } from "~/providers/KeycloakProvider";
import { useLocation, Navigate, Outlet } from "react-router";
import LoadingSpinner from "~/components/LoadingSpinner"; 

export default function RoleLayout() {
    const { isInitialized, isSuperAdmin } = useKeycloak();
    const location = useLocation();

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner
                    size="lg"
                    message="Checking user permissions..."
                />
            </div>
        );
    }

    if (isInitialized && isSuperAdmin && (location.pathname === "/" || location.pathname === "/overview")) {
        return <Navigate to="/super-admin/overview" replace />;
    }

    return <Outlet />;
}