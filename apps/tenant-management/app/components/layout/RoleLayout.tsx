import { useUser } from "@clerk/react-router";
import { useLocation, Navigate, Outlet } from "react-router";
import LoadingSpinner from "~/components/LoadingSpinner"; 

export default function RoleLayout() {
    const { isLoaded, user } = useUser();
    const role = user?.publicMetadata?.role;
    const location = useLocation();
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner
                    size="lg"
                    message="Checking user permissions..."
                />
            </div>
        );
    }

    if (isLoaded && role === "super-admin" && !location.pathname.startsWith("/super-admin")) {
        return <Navigate to="/super-admin/overview" replace />;
    }

    return <Outlet />;
}