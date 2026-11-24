import BillingPage from "~/pages/protected/BillingPage";
import RoutePermissionGuard from "~/components/layout/RoutePermissionGuard";
import type { Route } from "./+types/billing";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ERPEZ" },
        { name: "description", content: "Billing Management" },
    ];
}

export default function Billing() {
    return (
        <RoutePermissionGuard permission="tenant.billing.view">
            <BillingPage />
        </RoutePermissionGuard>
    );
}
