import { createQueryHookFromTemplate } from "erpez-shared-lib";
import { useState } from "react";
import { PageContainer } from "~/components/PageContainer";
import { TenantCard } from "~/components/TenantCard";
import { TenantFilterTab } from "~/components/TenantFilterTab";
import { planLabel, PLAN_OPTIONS } from "~/lib/tenant";
import { TenantSearchBar } from "~/components/TenantSearchBar";

import { getTenantsRequest } from "~/features/tenant/handlers/getTenantsRequest";

const useTenant = createQueryHookFromTemplate(getTenantsRequest);
export default function TenantManagementPage() {

    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");

    const { data: tenants } = useTenant({
        pathParams: {},
        queryParams: {
            pageSize: 50,
            pageNumber: 1,
        }
    });
    const tenantsList = tenants ? tenants.data : []; 
    const filteredTenants = tenantsList.filter((tenant) => {
        const tenantPlan = planLabel(tenant.tenantSubscription?.plan ?? undefined);
        const matchesFilter = filter === "All" || tenantPlan === filter;
        const matchesSearch = tenant.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });
    const totalRevenue = filteredTenants.reduce((total, tenant) => total + (tenant.tenantSubscription?.amount ?? 0), 0);
    const activeTenants = filteredTenants.filter(tenant => tenant.tenantSubscription?.status === 'Active').length;

    console.log({ tenantsList, filteredTenants });
    return (
        <PageContainer
            title="Tenant Management"
            description="Manage and monitor all tenant organizations"
            actions={
                <div className="flex gap-6 text-right">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-emerald-600 font-semibold text-lg">
                            ${totalRevenue.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Active Tenants</p>
                        <p className="text-blue-600 font-semibold text-lg">
                            {activeTenants}/{tenantsList.length}
                        </p>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 my-4">
                <div className="flex lg:flex-row gap-6 flex-col ">
                    <TenantSearchBar value={search} onChange={setSearch} />
                    <TenantFilterTab value={filter} onChange={setFilter} plans={PLAN_OPTIONS} />
                </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTenants.map((tenant) => (
                    <TenantCard
                        key={tenant.id}
                        id={tenant.id}
                        name={tenant.name}
                        phone={tenant.billingContactEmail || "N/A"}
                        plan={tenant.tenantSubscription?.plan}
                        tenantStatus={tenant.tenantSubscription?.status}
                        revenue={tenant.tenantSubscription?.amount ?? 0}
                        users={10}
                        amount={tenant.tenantSubscription?.amount ?? 0}
                        tenant={tenant}
                    />
                ))}
            </div>
        </PageContainer>
    );
}
