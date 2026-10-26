import React from "react";
import { createQueryHookFromTemplate } from "erpez-shared-lib";
import { useNavigate } from "react-router";
import { PageContainer } from "~/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { StatCard } from "~/components/StatCard";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { getTenantsRequest } from "~/features/tenant/handlers/getTenantsRequest";
import { getInquiriesRequest } from "~/features/inquiry/handlers/getInquiriesRequest";
import { planLabel } from "~/lib/tenant";
import {
    Building2,
    CheckCircle2,
    AlertTriangle,
    HardDrive,
    Server,
    Activity,
    Database,
    FileText,
    Cloud,
    ExternalLink,
} from "lucide-react";

const useTenants = createQueryHookFromTemplate(getTenantsRequest);
const useInquiries = createQueryHookFromTemplate(getInquiriesRequest);

export default function SuperAdminOverviewPage() {
    const navigate = useNavigate();

    const { data: tenantsResponse, isLoading: isLoadingTenants } = useTenants({
        pathParams: {},
        queryParams: { pageSize: 50, pageNumber: 1 },
    });

    const { data: inquiriesResponse } = useInquiries({});

    const tenantsList = Array.isArray(tenantsResponse?.data) ? tenantsResponse.data : [];
    const totalWorkspaces = tenantsList.length;
    const activeWorkspaces = tenantsList.filter((t) => !t.isDisabled).length;
    const disabledWorkspaces = tenantsList.filter((t) => t.isDisabled).length;
    const onPremWorkspaces = tenantsList.filter((t) => Boolean(t.tenantSetting?.onPremise)).length;
    const cloudWorkspaces = Math.max(0, totalWorkspaces - onPremWorkspaces);

    const dedicatedTenants = tenantsList.filter((t) =>
        Boolean(t.tenantSetting?.dbConnectionString && t.tenantSetting.dbConnectionString.trim())
    );
    const dedicatedCount = dedicatedTenants.length;
    const sharedPoolCount = Math.max(0, totalWorkspaces - dedicatedCount);

    const quotesCount = inquiriesResponse?.data?.quotes?.length ?? 0;
    const demosCount = inquiriesResponse?.data?.demos?.length ?? 0;
    const totalInquiries = quotesCount + demosCount;

    const stats = [
        { label: "Total Workspaces", value: isLoadingTenants ? "..." : String(totalWorkspaces), icon: Building2 },
        { label: "Active Workspaces", value: isLoadingTenants ? "..." : String(activeWorkspaces), icon: CheckCircle2 },
        { label: "Sales Inquiries", value: String(totalInquiries), icon: FileText },
        { label: "Database Silos", value: isLoadingTenants ? "..." : `${dedicatedCount} Dedicated`, icon: Database },
    ];

    const provisioningStatuses = [
        {
            label: "Ready / Operational",
            count: activeWorkspaces,
            icon: CheckCircle2,
            color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        },
        {
            label: "Cloud SaaS",
            count: cloudWorkspaces,
            icon: Cloud,
            color: "text-blue-600 bg-blue-50 border-blue-200",
        },
        {
            label: "Disabled / Suspended",
            count: disabledWorkspaces,
            icon: AlertTriangle,
            color: "text-amber-600 bg-amber-50 border-amber-200",
        },
        {
            label: "Self-Hosted / On-Prem",
            count: onPremWorkspaces,
            icon: HardDrive,
            color: "text-purple-600 bg-purple-50 border-purple-200",
        },
    ];

    return (
        <PageContainer
            title="Platform Overview"
            description="Control-plane summary of registered customer workspaces, database isolation, and incoming inquiries."
        >
            {/* Top Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s, i) => (
                    <StatCard key={i} {...s} />
                ))}
            </div>

            {/* Workspace Provisioning & Database Health */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900">
                                    Workspace Status Breakdown
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500">
                                    Current operational state across registered customer workspaces
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs">
                                <Activity className="w-3 h-3 text-emerald-600" />
                                {totalWorkspaces > 0
                                    ? `${activeWorkspaces}/${totalWorkspaces} Active`
                                    : "Ready"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="grid grid-cols-2 gap-3">
                            {provisioningStatuses.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={index}
                                        className={`p-3.5 rounded-xl border flex items-center justify-between ${item.color}`}
                                    >
                                        <div>
                                            <span className="text-xs font-semibold block text-slate-800">
                                                {item.label}
                                            </span>
                                            <span className="text-xl font-black mt-0.5 block text-slate-900">
                                                {item.count}
                                            </span>
                                        </div>
                                        <Icon className="w-5 h-5 opacity-80 shrink-0" />
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900">
                                    Database Routing Architecture
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500">
                                    Multi-tenant database isolation across registered workspaces
                                </CardDescription>
                            </div>
                            <Server className="w-4 h-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2 space-y-3">
                        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-purple-600 shrink-0" />
                                <div>
                                    <span className="font-semibold text-purple-900 block">
                                        Dedicated Database Silos ({dedicatedCount})
                                    </span>
                                    <span className="text-purple-700 text-[11px]">
                                        {dedicatedCount > 0
                                            ? dedicatedTenants.map((t) => t.name).join(", ")
                                            : "No dedicated database silos currently configured"}
                                    </span>
                                </div>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200 text-[10px]">
                                Isolated DB
                            </Badge>
                        </div>

                        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-blue-600 shrink-0" />
                                <div>
                                    <span className="font-semibold text-blue-900 block">
                                        Shared Database Pool ({sharedPoolCount})
                                    </span>
                                    <span className="text-blue-700 text-[11px]">
                                        Logical isolation via TenantId on shared PostgreSQL pool
                                    </span>
                                </div>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 text-[10px]">
                                Multi-Tenant
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Registered Customer Workspaces Table */}
            <Card className="mt-6 border-slate-200 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900">
                                Registered Customer Workspaces
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Active directory of customer workspaces, assigned plans, and isolation modes
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/super-admin/tenant-management")}
                            className="text-xs h-8 gap-1.5"
                        >
                            Manage Workspaces
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                            <tr>
                                <th className="py-3 px-4">Workspace</th>
                                <th className="py-3 px-4">Plan Tier</th>
                                <th className="py-3 px-4">Billing Contact</th>
                                <th className="py-3 px-4">Database Mode</th>
                                <th className="py-3 px-4">Access State</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tenantsList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400">
                                        {isLoadingTenants ? "Loading workspaces..." : "No workspaces registered yet."}
                                    </td>
                                </tr>
                            ) : (
                                tenantsList.slice(0, 8).map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3 px-4 font-semibold text-slate-900">
                                            {t.name}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="secondary" className="text-[11px]">
                                                {planLabel(t.tenantSubscription?.plan)}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                                            {t.tenantSetting?.billingContactEmail || "—"}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {t.tenantSetting?.dbConnectionString
                                                ? "Dedicated Instance"
                                                : "Shared Pool"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge
                                                className={
                                                    t.isDisabled
                                                        ? "bg-red-100 text-red-700 hover:bg-red-100 text-[10px]"
                                                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px]"
                                                }
                                            >
                                                {t.isDisabled ? "Disabled" : "Active"}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/super-admin/tenant/${t.id}`)}
                                                className="h-7 text-xs text-blue-600 hover:text-blue-700"
                                            >
                                                Profile
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </PageContainer>
    );
}
