import type { Route } from "./+types/subscription";
import SubscriptionPage from "~/pages/protected/SubscriptionPage";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ERPEZ" },
        { name: "description", content: "Subscription Management" },
    ];
}

export default function Subscription() {
    return <SubscriptionPage />;
}
