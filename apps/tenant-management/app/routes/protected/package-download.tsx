import PackageDownloadPage from "~/pages/protected/PackageDownload";
import type { Route } from "./+types/package-download";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ERPEZ" },
        { name: "description", content: "Package Download Management" },
    ];
}

export default function PackageDownload() {
    return <PackageDownloadPage />;
}
