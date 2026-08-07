import type { Route } from "./+types/module";
import ModulePage from "~/pages/protected/ModulePage";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ERPEZ Module" },
        { name: "description", content: "Module management for your tenant." },
    ];
}

export default function Module() {
    return <ModulePage />;
}
