import type { Route } from "./+types/module";
import ModulePage from "~/pages/protected/ModulePage";
import RoutePermissionGuard from "~/components/layout/RoutePermissionGuard";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ERPEZ Module" },
        { name: "description", content: "Module management for your tenant." },
    ];
}

export default function Module() {
    return (
        <RoutePermissionGuard permission="tenant.modules.view">
            <ModulePage />
        </RoutePermissionGuard>
    );
}
