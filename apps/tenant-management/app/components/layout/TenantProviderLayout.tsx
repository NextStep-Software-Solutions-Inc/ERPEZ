import { TenantProvider } from "~/providers/TenantProvider";
import { Outlet } from "react-router";

export default function TenantProviderLayout() {
    return (
        <TenantProvider>
            <Outlet />
        </TenantProvider>
    );
}