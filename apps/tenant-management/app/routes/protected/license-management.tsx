import type { Route } from "./+types/license-management";
import LicenseManagementPage from "~/pages/protected/LicenseManagement";
import RoutePermissionGuard from "~/components/layout/RoutePermissionGuard";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ERPEZ" },
        { name: "description", content: "License Management" },
    ];
}

export default function LicenseManagement() {
    return (
        <RoutePermissionGuard permission="tenant.licenses.view">
            <LicenseManagementPage />
        </RoutePermissionGuard>
    );
}
