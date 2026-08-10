import { PageContainer } from "~/components/PageContainer"
import type { Tenant } from "~/features/tenant/type/Tenant"
import { planLabel, statusLabel } from "~/lib/tenant"


function TenantProfile({ tenant }: { tenant: Tenant }) {
    return (
        <PageContainer backTo={true}>
            <div className="  ">
                <div className="flex items-start justify-between mb-6 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-black text-white flex items-center justify-center font-semibold text-xl">{(tenant.name || '').split(' ').map(w => w?.[0] ?? '').join('').toUpperCase()}</div>
                        <div>
                            <h1 className="text-2xl font-semibold">{tenant.name}</h1>
                            <div className="flex gap-2 mt-2">
                                <span className="px-2 py-1 rounded bg-gray-100 text-sm">{planLabel(tenant.tenantSubscription?.plan ?? undefined)}</span>
                                {(() => {
                                    const dispStatus = statusLabel(tenant.tenantSubscription?.status);
                                    console.log({ dispStatus: tenant.tenantSubscription?.status })
                                    const statusColor =
                                        dispStatus === "Active"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : dispStatus === "Trial"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700";
                                    return (
                                        <span className={`px-2 py-1 rounded text-sm ${statusColor}`}>{dispStatus ?? 'Unknown'}</span>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 border rounded col-span-1">
                        <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                        <div className="text-2xl font-semibold mt-2">$ 299.00</div>
                    </div>
                    <div className="p-4 border rounded col-span-1">
                        <div className="text-sm text-muted-foreground">Active User</div>
                        <div className="text-2xl font-semibold mt-2">1</div>
                    </div>
                    <div className="p-4 border rounded col-span-1">
                        <div className="text-sm text-muted-foreground">Modules</div>
                        <div className="text-2xl font-semibold mt-2">2</div>
                    </div>
                    <div className="p-4 border rounded col-span-1">
                        <div className="text-sm text-muted-foreground">Member Since</div>
                        <div className="text-2xl font-semibold mt-2">2024</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded">
                        <h2 className="text-lg font-medium mb-3">Contact Information</h2>
                        <p className="flex items-center gap-2"><span className="opacity-70">Phone:</span> +36 920 2082 123</p>
                        <p className="flex items-center gap-2"><span className="opacity-70">Email:</span> acmeCorporation@gmail.com</p>
                        <p className="flex items-center gap-2"><span className="opacity-70">Address:</span> 123 Business Ave, New York, NY 001</p>
                    </div>

                    <div className="p-6 border rounded">
                        <h2 className="text-lg font-medium mb-3">Subscription Details</h2>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Current Plan</div>
                            <div className="font-medium">{planLabel(tenant.tenantSubscription?.plan ?? undefined)}</div>

                            <div className="text-sm text-muted-foreground">Status</div>
                            <div className="font-medium">{statusLabel(tenant.tenantSubscription?.status ?? undefined)}</div>

                            <div className="text-sm text-muted-foreground">Users</div>
                            {/* <div className="font-medium">{tenant.tenantSubscription?.users ?? 0}</div> */}

                            <div className="text-sm text-muted-foreground">Monthly Cost</div>
                            <div className="font-medium">${tenant.tenantSubscription?.amount ?? 0}/month</div>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-muted-foreground mb-1">Modules</p>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded border">AMS</span>
                                <span className="px-2 py-1 rounded border">Planning</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </PageContainer>
    )
}

export default TenantProfile