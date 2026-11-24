import { useParams } from "react-router";
import { createQueryHookFromTemplate } from "erpez-shared-lib";
import { getTenantRequest } from "~/features/tenant/handlers/getTenantRequest";
import TenantProfile from "~/pages/protected/super-admin/TenantProfile";

const useTenant = createQueryHookFromTemplate(getTenantRequest);

export default function TenantProfilePage() {
    const params = useParams();
    const tenantId = params.id ?? "";
    const { data: tenantResponse, isLoading, refetch } = useTenant({ pathParams: { id: tenantId }, queryParams: {} });

    if (isLoading) {
        return (
            <div className="p-8">
                <p className="text-muted-foreground">Loading tenant...</p>
            </div>
        );
    }

    const tenant = tenantResponse?.data;
    if (!tenant) {
        return (
            <div className="p-8">
                <p className="text-muted-foreground">Tenant not found</p>
            </div>
        );
    }

    return (
        <TenantProfile tenant={tenant} onTenantUpdated={refetch} />
    );
}
