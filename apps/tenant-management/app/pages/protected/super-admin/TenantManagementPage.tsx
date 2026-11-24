import { createQueryHookFromTemplate, createMutationHookFromTemplate } from "erpez-shared-lib";
import { useState } from "react";
import { PageContainer } from "~/components/PageContainer";
import { TenantCard } from "~/components/TenantCard";
import { TenantFilterTab } from "~/components/TenantFilterTab";
import { planLabel, PLAN_OPTIONS } from "~/lib/tenant";
import { TenantSearchBar } from "~/components/TenantSearchBar";
import LoadingSpinner from "~/components/LoadingSpinner";
import { getTenantsRequest } from "~/features/tenant/handlers/getTenantsRequest";
import { toggleTenantStatusRequest } from "~/features/tenant/handlers/toggleTenantStatusRequest";
import { LicenseManagementModal } from "~/features/license/components/LicenseManagementModal";
import { Shield, Server } from "lucide-react";
import { toast } from "sonner";

const useTenant = createQueryHookFromTemplate(getTenantsRequest);
const useToggleTenantStatus = createMutationHookFromTemplate(toggleTenantStatusRequest);

export default function TenantManagementPage() {
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");

    const { data: tenants, isLoading, refetch } = useTenant({
        pathParams: {},
        queryParams: {
            pageSize: 50,
            pageNumber: 1,
        }
    });

    const toggleStatusMutation = useToggleTenantStatus();

    const tenantsList = Array.isArray(tenants?.data) ? tenants.data : []; 
    const filteredTenants = tenantsList.filter((tenant) => {
        if (!tenant) return false;
        const tenantPlan = planLabel(tenant.tenantSubscription?.plan ?? undefined);
        const matchesFilter = filter === "All" || tenantPlan === filter;
        const matchesSearch = (tenant.name || "").toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const totalWorkspaces = tenantsList.length;
    const activeWorkspaces = tenantsList.filter(t => !t.isDisabled).length;
    const disabledWorkspaces = tenantsList.filter(t => t.isDisabled).length;

    const handleToggleStatus = async (id: string, newDisabled: boolean) => {
        try {
            await toggleStatusMutation.mutateAsync({
                pathParams: { id },
                payload: { isDisabled: newDisabled },
            });
            toast.success(newDisabled ? "Tenant has been disabled and login disallowed." : "Tenant enabled successfully.");
            await refetch();
        } catch {
            // Error toast handled by axios interceptor
        }
    };

    return (
        <PageContainer
            title="Workspaces"
            description="Manage customer workspaces, enterprise database routing silos, and subscription plans."
            actions={
                <div className="flex flex-wrap items-center gap-4">
                    <div className="hidden sm:flex gap-6 text-right">
                        <div>
                            <p className="text-xs text-muted-foreground">Total Workspaces</p>
                            <p className="text-blue-600 font-semibold text-base">
                                {totalWorkspaces}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Active Workspaces</p>
                            <p className="text-emerald-600 font-semibold text-base">
                                {activeWorkspaces}
                            </p>
                        </div>
                        {disabledWorkspaces > 0 && (
                            <div>
                                <p className="text-xs text-muted-foreground">Disabled</p>
                                <p className="text-rose-600 font-semibold text-base">
                                    {disabledWorkspaces}
                                </p>
                            </div>
                        )}
                    </div>
                    <LicenseManagementModal onSuccess={() => refetch()} />
                </div>
            }
        >

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 my-4">
                <div className="flex lg:flex-row gap-6 flex-col ">
                    <TenantSearchBar value={search} onChange={setSearch} />
                    <TenantFilterTab value={filter} onChange={setFilter} plans={PLAN_OPTIONS} />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="md" message="Loading tenants..." />
                </div>
            ) : filteredTenants.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground">
                    No tenants found matching your criteria.
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredTenants.map((tenant) => (
                        <TenantCard
                            key={tenant.id}
                            id={tenant.id}
                            name={tenant.name}
                            phone={tenant.tenantSetting?.billingContactEmail || "N/A"}
                            plan={tenant.tenantSubscription?.plan}
                            tenantStatus={tenant.tenantSubscription?.status}
                            revenue={tenant.tenantSubscription?.amount ?? 0}
                            amount={tenant.tenantSubscription?.amount ?? 0}
                            modules={tenant.modules?.map((m) => m.key.toUpperCase())}
                            tenant={tenant}
                            isDisabled={tenant.isDisabled}
                            onToggleStatus={handleToggleStatus}
                        />
                    ))}
                </div>
            )}
        </PageContainer>
    );
}
