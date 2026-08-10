import BillingPage from "~/pages/protected/BillingPage";
import type { Route } from "./+types/billing";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ERPEZ" },
        { name: "description", content: "Billing Management" },
    ];
}

export default function Billing() {
    return <BillingPage />;
}
