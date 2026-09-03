import { useKeycloak } from "~/providers/KeycloakProvider";
import { Navigate, Outlet } from "react-router";
import LoadingSpinner from "~/components/LoadingSpinner";

export default function ProtectedLayout() {
    const { isAuthenticated, isInitialized } = useKeycloak();

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" message="Authenticating..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/sign-in" replace />;
    }

    return <Outlet />;
}
