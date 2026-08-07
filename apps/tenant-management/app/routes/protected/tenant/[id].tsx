import { useParams, useNavigate } from "react-router";

import { createQueryHookFromTemplate } from "erpez-shared-lib";
import { getTenantsRequest } from "~/features/tenant/handlers/getTenantsRequest";
import { type Tenant } from "~/features/tenant/type/Tenant"; 
import TenantProfile from "~/pages/protected/super-admin/TenantProfile";

const useTenants = createQueryHookFromTemplate(getTenantsRequest);

export default function TenantProfilePage() {
    const params = useParams(); 
    const { data: tenants, isLoading } = useTenants({ pathParams: {}, queryParams: { pageSize: 50, pageNumber: 1 } });
    if (isLoading) {
        return (
            <div className="p-8">
                <p className="text-muted-foreground">Loading tenant...</p>
            </div>
        );
    }

    const tenantId = params.id;
    const tenant = tenants?.data?.find((t: Tenant) => String(t.id) === String(tenantId));

    if (process.env.NODE_ENV === "development") {
        console.log({ tenant });
    }
    if (!tenant) {
        return (
            <div className="p-8">
                <p className="text-muted-foreground">Tenant not found</p>
            </div>
        );
    }
    return (
        <TenantProfile tenant={tenant} />
    );
}
