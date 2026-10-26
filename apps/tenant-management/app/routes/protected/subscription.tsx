import type { Route } from "./+types/subscription";
import SubscriptionPage from "~/pages/protected/SubscriptionPage";
import RoutePermissionGuard from "~/components/layout/RoutePermissionGuard";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ERPEZ" },
        { name: "description", content: "Subscription Management" },
    ];
}

export default function Subscription() {
    return (
        <RoutePermissionGuard permission="tenant.subscriptions.view">
            <SubscriptionPage />
        </RoutePermissionGuard>
    );
}
