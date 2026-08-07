import type { Route } from "./+types/license-management";
import LicenseManagementPage from "~/pages/protected/LicenseManagement";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ERPEZ" },
        { name: "description", content: "License Management" },
    ];
}

export default function LicenseManagement() {
    return <LicenseManagementPage />;
}
