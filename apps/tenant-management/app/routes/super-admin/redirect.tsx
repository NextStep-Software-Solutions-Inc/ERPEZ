import { Navigate } from "react-router";

export default function SuperAdminRedirect() {
    return <Navigate to="/super-admin/overview" replace />;
}
