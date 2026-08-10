import type { Route } from "./+types/overview";
import SuperAdminOverviewPage from "~/pages/protected/super-admin/SuperAdminOverviewPage";


export function meta() {
    return [
        { title: "ERPEZ Overview" },
        { name: "description", content: "Overview of your tenant management." },
    ];
}

export default function Overview() {

    return <SuperAdminOverviewPage />;
}
