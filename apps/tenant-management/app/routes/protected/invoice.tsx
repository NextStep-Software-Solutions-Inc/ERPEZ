import InvoicePage from "~/pages/protected/InvoicePage";
import RoutePermissionGuard from "~/components/layout/RoutePermissionGuard";
import type { Route } from "./+types/invoice";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ERPEZ" },
        { name: "description", content: "Invoice Management" },
    ];
}

export default function Invoice() {
    return (
        <RoutePermissionGuard permission="tenant.invoices.view">
            <InvoicePage />
        </RoutePermissionGuard>
    );
}
