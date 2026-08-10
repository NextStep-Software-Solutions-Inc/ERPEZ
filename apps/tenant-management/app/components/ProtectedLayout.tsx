import { useAuth, useUser } from '@clerk/react-router';
import { Navigate, Outlet, useLocation } from 'react-router';

export default function ProtectedLayout() {
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const location = useLocation();

    if (!isSignedIn) {
        return <Navigate to="/sign-in" replace />;
    }

    const role = user?.publicMetadata?.role;

    if (role === "super-admin" && !location.pathname.startsWith("/super-admin")) { // Changed to match your routes; update Clerk metadata accordingly
        // Always navigate super-admin to their overview
        return <Navigate to="/super-admin/overview" replace />;
    } else {
    // Render tenant outlet (OverviewLayout and its routes)
        return <Outlet />;
    }
}