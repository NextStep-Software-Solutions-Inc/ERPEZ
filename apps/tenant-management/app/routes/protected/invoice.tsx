import InvoicePage from "~/pages/protected/InvoicePage";
import type { Route } from "./+types/invoice";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ERPEZ" },
        { name: "description", content: "Invoice Management" },
    ];
}

export default function Invoice() {
    return <InvoicePage />;
}
