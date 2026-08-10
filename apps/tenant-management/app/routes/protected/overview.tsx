import OverviewPage from "~/pages/protected/OverviewPage";
import type { Route } from "./+types/overview";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ERPEZ Overview" },
        { name: "description", content: "Overview of your tenant management." },
    ];
}

export default function Overview() { 
    return (
        <OverviewPage />
    );
}
