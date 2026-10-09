import { useState } from "react";
import { useNavigate } from "react-router";
import { PageContainer } from "~/components/PageContainer";
import type { Tenant } from "~/features/tenant/type/Tenant";
import { planLabel, statusLabel } from "~/lib/tenant";
import { createQueryHookFromTemplate, createMutationHookFromTemplate } from "erpez-shared-lib";
import * as erpSharedLib from "erpez-shared-lib";
import invalidateQueries from "~/services/utils/queries";
import { getTenantLicenseRequest } from "~/features/license/handlers/getTenantLicenseRequest";
import { toggleTenantStatusRequest } from "~/features/tenant/handlers/toggleTenantStatusRequest";
import { LicenseManagementModal } from "~/features/license/components/LicenseManagementModal";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { KeyRound, ShieldCheck, ShieldAlert, Copy, Check, Server, Lock, Database, Eye } from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "~/providers/TenantProvider";

const { useQueryClient } = erpSharedLib;
const useTenantLicense = createQueryHookFromTemplate(getTenantLicenseRequest);
const useToggleStatus = createMutationHookFromTemplate(toggleTenantStatusRequest);

interface TenantProfileProps {
    tenant: Tenant;
    onTenantUpdated?: () => void;
}

function TenantProfile({ tenant, onTenantUpdated }: TenantProfileProps) {
    const navigate = useNavigate();
    const { startSpectating } = useTenant();
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);
    const [isDisabled, setIsDisabled] = useState(tenant.isDisabled ?? false);

    const { data: licenseResponse, refetch: refetchLicense } = useTenantLicense({
        pathParams: { id: tenant.id },
        queryParams: { domain: window.location.hostname },
    });

    const toggleStatusMutation = useToggleStatus();
    const license = licenseResponse?.data;

    const displayPlan = planLabel(tenant.tenantSubscription?.plan || license?.plan);
    const displayStatus = statusLabel(tenant.tenantSubscription?.status || (license ? "Active" : undefined));
    const defaultAmount = displayPlan === "Professional" ? 299 : displayPlan === "Starter" ? 99 : displayPlan === "Enterprise" ? 999 : 0;
    const displayAmount = tenant.tenantSubscription?.amount ?? (license ? defaultAmount : 0);

    const handleCopyKey = () => {
        if (!license?.key) return;
        navigator.clipboard.writeText(license.key);
        setCopied(true);
        toast.success("License key copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleToggleStatus = async () => {
        const nextState = !isDisabled;
        try {
            await toggleStatusMutation.mutateAsync({
                pathParams: { id: tenant.id },
                payload: { isDisabled: nextState },
            });
            setIsDisabled(nextState);
            toast.success(nextState ? "Tenant has been disabled." : "Tenant has been enabled.");
        } catch {
            // Error toast handled by axios interceptor
        }
    };

    return (
        <PageContainer
            backTo={true}
            actions={
                <div className="flex items-center gap-3">
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1.5 shadow-xs"
                        onClick={() => {
                            startSpectating({ id: tenant.id, name: tenant.name });
                            navigate('/overview');
                        }}
                    >
                        <Eye className="h-4 w-4" />
                        Spectate Workspace
                    </Button>
                    <Button
                        variant={isDisabled ? "default" : "destructive"}
                        size="sm"
                        onClick={handleToggleStatus}
                    >
                        {isDisabled ? "Enable Tenant Access" : "Disallow & Disable Tenant"}
                    </Button>
                    <LicenseManagementModal
                        tenantId={tenant.id}
                        tenantName={tenant.name}
                        onSuccess={() => {
                            refetchLicense();
                            onTenantUpdated?.();
                            invalidateQueries(queryClient, "/tenants");
                        }}
                        triggerButton={
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4" />
                                {license ? "Issue New License" : "Assign License"}
                            </Button>
                        }
                    />
                </div>
            }
        >
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-black text-white flex items-center justify-center font-semibold text-xl">
                            {(tenant.name || '').split(' ').map(w => w?.[0] ?? '').join('').toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold">{tenant.name}</h1>
                                <Badge className={isDisabled ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"}>
                                    Platform: {isDisabled ? "Access Disabled" : "Active & Allowed"}
                                </Badge>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <span className="px-2.5 py-1 rounded bg-gray-100 text-sm font-medium">Plan: {displayPlan}</span>
                                {(() => {
                                    const statusColor =
                                        displayStatus === "Active"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : displayStatus === "Trial"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700";
                                    return (
                                        <span className={`px-2.5 py-1 rounded text-sm font-medium ${statusColor}`}>Subscription: {displayStatus}</span>
                                    );
                                })()}
                                {tenant.tenantSetting?.onPremise && (
                                    <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-sm font-medium flex items-center gap-1">
                                        <Server className="w-3.5 h-3.5" />
                                        On-Premise Bundle
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded col-span-1 bg-white">
                        <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                        <div className="text-2xl font-semibold mt-2">₱{displayAmount}.00</div>
                    </div>
                    <div className="p-4 border rounded col-span-1 bg-white">
                        <div className="text-sm text-muted-foreground">Active User</div>
                        <div className="text-2xl font-semibold mt-2">1</div>
                    </div>
                    <div className="p-4 border rounded col-span-1 bg-white">
                        <div className="text-sm text-muted-foreground">Allowed Domain</div>
                        <div className="text-base font-semibold font-mono mt-2 truncate">
                            {license?.allowedDomain || tenant.allowedDomain || tenant.tenantSetting?.allowedDomain || "Not Restricted (*)"}
                        </div>
                    </div>
                    <div className="p-4 border rounded col-span-1 bg-white">
                        <div className="text-sm text-muted-foreground">Deployment Mode</div>
                        <div className="text-base font-semibold mt-2">
                            {license?.isAirGapped ? "Air-Gapped Sovereign" : "Datacenter Cloud"}
                        </div>
                    </div>
                </div>

                {/* Cryptographic License Key Section */}
                <div className="p-5 border rounded-xl bg-slate-50/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-blue-600" />
                            <h3 className="font-bold text-slate-900 text-base">Cryptographic License Key</h3>
                        </div>
                        {license ? (
                            <Badge className={license.isExpired ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}>
                                {license.isExpired ? "Expired" : "Active Key Bound"}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-slate-500">
                                No License Assigned
                            </Badge>
                        )}
                    </div>

                    {license ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3 font-mono text-sm shadow-xs">
                                <span className="text-slate-900 font-semibold break-all">{license.key}</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCopyKey}
                                    className="ml-3 shrink-0 h-8 px-2.5"
                                >
                                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                                <div className="bg-white p-2.5 rounded border">
                                    <span className="text-slate-400 block mb-0.5">Bound Email</span>
                                    <strong className="text-slate-800">{license.boundEmail}</strong>
                                </div>
                                <div className="bg-white p-2.5 rounded border">
                                    <span className="text-slate-400 block mb-0.5">Allowed Domain Lock</span>
                                    <strong className="text-slate-800 font-mono">{license.allowedDomain}</strong>
                                </div>
                                <div className="bg-white p-2.5 rounded border">
                                    <span className="text-slate-400 block mb-0.5">Expiration & Remaining</span>
                                    <strong className="text-slate-800">
                                        {new Date(license.expiresAt).toLocaleDateString()} ({license.remainingDays} days left)
                                    </strong>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-white rounded-lg border border-dashed text-slate-500 text-xs">
                            This tenant does not have an active cryptographic license key assigned yet.
                            Click "Assign License" above to generate a sovereign key.
                        </div>
                    )}
                </div>

                {/* Database Architecture & Multi-Tenant Routing Section */}
                <div className="p-5 border rounded-xl bg-white shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-bold text-slate-900 text-base">Database Routing & Multi-Tenant Isolation</h3>
                        </div>
                        {tenant.tenantSetting?.dbConnectionString ? (
                            <Badge className="bg-indigo-100 text-indigo-700 font-semibold border-indigo-200">
                                Dedicated Database Silo (Enterprise)
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-slate-600 border-slate-300">
                                Shared Cloud Database Pool
                            </Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
                        <div className="bg-slate-50 p-3 rounded-lg border">
                            <span className="text-slate-400 block mb-0.5">Database Strategy</span>
                            <strong className="text-slate-900 text-sm">
                                {tenant.tenantSetting?.dbConnectionString
                                    ? "Dedicated PostgreSQL Instance"
                                    : "Multi-Tenant Shared Pool (Row Filtered)"}
                            </strong>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border">
                            <span className="text-slate-400 block mb-0.5">Multi-Subsidiary Quota</span>
                            <strong className="text-slate-900 text-sm font-mono">
                                Up to {tenant.maxAllowedTenants || tenant.tenantSetting?.maxAllowedTenants || 10} Subsidiaries Allowed
                            </strong>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border">
                            <span className="text-slate-400 block mb-0.5">Tenant Operational Base URL</span>
                            <strong className="text-slate-900 text-sm font-mono truncate block">
                                {tenant.tenantSetting?.baseURL || "http://localhost:5245"}
                            </strong>
                        </div>
                    </div>

                    {tenant.tenantSetting?.dbConnectionString && (
                        <div className="bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                                Resolved Operational Connection String
                            </span>
                            <code>{tenant.tenantSetting.dbConnectionString}</code>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded bg-white">
                        <h2 className="text-lg font-medium mb-3">Contact Information</h2>
                        <p className="flex items-center gap-2"><span className="opacity-70">Phone:</span> +36 920 2082 123</p>
                        <p className="flex items-center gap-2"><span className="opacity-70">Email:</span> {tenant.tenantSetting?.billingContactEmail || "acmeCorporation@gmail.com"}</p>
                        <p className="flex items-center gap-2"><span className="opacity-70">Address:</span> 123 Business Ave, New York, NY 001</p>
                    </div>

                    <div className="p-6 border rounded bg-white">
                        <h2 className="text-lg font-medium mb-3">Subscription Details</h2>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Current Plan</div>
                            <div className="font-medium">{displayPlan}</div>

                            <div className="text-sm text-muted-foreground">Status</div>
                            <div className="font-medium">{displayStatus}</div>

                            <div className="text-sm text-muted-foreground">Monthly Cost</div>
                            <div className="font-medium">₱{displayAmount}/month</div>
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
    );
}

export default TenantProfile;