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

    const totalRevenue = filteredTenants.reduce((total, tenant) => total + (tenant.tenantSubscription?.amount ?? 0), 0);
    const activeTenants = filteredTenants.filter(t => !t.isDisabled && t.tenantSubscription?.status === 'Active').length;
    const maxAllowedCapacity = tenantsList[0]?.maxAllowedTenants || tenantsList[0]?.tenantSetting?.maxAllowedTenants || 10;

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
            title="Tenant Management"
            description="Manage, monitor, and enforce license limits for all tenant organizations"
            actions={
                <div className="flex flex-wrap items-center gap-4">
                    <div className="hidden sm:flex gap-6 text-right">
                        <div>
                            <p className="text-xs text-muted-foreground">Active Tenants</p>
                            <p className="text-blue-600 font-semibold text-base">
                                {activeTenants}/{tenantsList.length}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Server Quota</p>
                            <p className="text-indigo-600 font-semibold text-base">
                                {tenantsList.length}/{maxAllowedCapacity}
                            </p>
                        </div>
                    </div>
                    <LicenseManagementModal onSuccess={() => refetch()} />
                </div>
            }
        >
            {/* On-Premise License Governance Banner */}
            <div className="my-4 p-4 rounded-xl border border-slate-200 bg-linear-to-r from-slate-50 via-blue-50/40 to-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <Server className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            On-Premise & Sovereign Multi-Tenancy Controls
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                <Shield className="w-3 h-3" />
                                Air-Gapped Enforcement
                            </span>
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                            Tenants are hosted on dedicated deployment database bundles. Domain constraints strictly disable unauthorized domain logins.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono bg-white px-3 py-1.5 rounded-md border text-slate-700">
                    <span>Usage: <strong>{tenantsList.length}</strong> / {maxAllowedCapacity} Max Allowed</span>
                </div>
            </div>

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
                            users={10}
                            amount={tenant.tenantSubscription?.amount ?? 0}
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
