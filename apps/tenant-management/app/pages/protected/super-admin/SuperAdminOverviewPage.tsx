import React from "react";
import { PageContainer } from "~/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { StatCard } from "~/components/StatCard";
import { Badge } from "~/components/ui/badge";
import {
    Building2,
    Shield,
    CreditCard,
    Database,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ShieldAlert,
    HardDrive,
    Server,
    Activity,
    Lock
} from "lucide-react";

export default function SuperAdminOverviewPage() {
    const stats = [
        { label: "Total Workspaces", value: "4", icon: Building2 },
        { label: "Platform Users", value: "3", icon: Shield },
        { label: "Active Subscriptions", value: "4", icon: CreditCard },
        { label: "Database Silos", value: "2 Dedicated", icon: Database },
    ];

    const provisioningStatuses = [
        { label: "Ready / Operational", count: 4, status: "healthy", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
        { label: "Provisioning Queue", count: 0, status: "idle", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-200" },
        { label: "Maintenance Mode", count: 0, status: "none", icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-200" },
        { label: "Sovereign / On-Prem", count: 1, status: "air-gapped", icon: HardDrive, color: "text-purple-600 bg-purple-50 border-purple-200" },
    ];

    const recentPlatformActivity = [
        {
            action: "Workspace Provisioned",
            target: "North Region Subsidiary Inc.",
            actor: "superadmin@erpez.dev",
            detail: "Assigned dedicated database silo (erpez_north_db)",
            timestamp: "Today, 11:42 AM",
            type: "provisioning",
        },
        {
            action: "Sovereign Deployment Configured",
            target: "South Distribution Corp.",
            actor: "superadmin@erpez.dev",
            detail: "Configured air-gapped on-premise connection (erpez_south_db)",
            timestamp: "Today, 11:38 AM",
            type: "security",
        },
        {
            action: "Platform Access Sync",
            target: "Master Keycloak Realm",
            actor: "auditor@erpez.dev",
            detail: "Verified OIDC claims and decoupled platform permissions",
            timestamp: "Today, 10:15 AM",
            type: "audit",
        },
        {
            action: "Enterprise License Active",
            target: "ERPEZ Enterprise Corp",
            actor: "System",
            detail: "10-subsidiary quota enabled with automated recurring billing",
            timestamp: "Yesterday, 4:20 PM",
            type: "subscription",
        },
    ];

    return (
        <PageContainer
            title="Platform Overview"
            description="Real-time control-plane metrics, workspace provisioning health, and platform security activity."
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
                                    Workspace Provisioning Status
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500">
                                    Operational lifecycle state across all customer organizations
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs">
                                <Activity className="w-3 h-3 text-emerald-600" />
                                100% Operational
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
                                    Multi-tenant physical database isolation distribution
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
                                    <span className="font-semibold text-purple-900 block">Dedicated Database Silos (2)</span>
                                    <span className="text-purple-700 text-[11px]">Physical isolation: erpez_north_db & erpez_south_db</span>
                                </div>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200 text-[10px]">
                                Enterprise Plan
                            </Badge>
                        </div>

                        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-blue-600 shrink-0" />
                                <div>
                                    <span className="font-semibold text-blue-900 block">Shared Database Pool (2)</span>
                                    <span className="text-blue-700 text-[11px]">Logical isolation via TenantId on shared PostgreSQL pool</span>
                                </div>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 text-[10px]">
                                Multi-Tenant
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Platform Control Plane Activity Log */}
            <Card className="mt-6 border-slate-200 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900">
                                Recent Platform Control Plane Activity
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Audit log of workspace provisioning, license changes, and platform role authorizations
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs text-slate-600">
                            Live Audit Stream
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                            <tr>
                                <th className="py-3 px-4">Action</th>
                                <th className="py-3 px-4">Target Workspace / Resource</th>
                                <th className="py-3 px-4">Actor</th>
                                <th className="py-3 px-4">Operational Detail</th>
                                <th className="py-3 px-4 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentPlatformActivity.map((log, index) => (
                                <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-3 px-4 font-semibold text-slate-900">
                                        <div className="flex items-center gap-1.5">
                                            {log.type === "provisioning" && <Database className="w-3.5 h-3.5 text-blue-600" />}
                                            {log.type === "security" && <Lock className="w-3.5 h-3.5 text-purple-600" />}
                                            {log.type === "audit" && <Shield className="w-3.5 h-3.5 text-amber-600" />}
                                            {log.type === "subscription" && <CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
                                            <span>{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-800 font-medium">
                                        {log.target}
                                    </td>
                                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                                        {log.actor}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                        {log.detail}
                                    </td>
                                    <td className="py-3 px-4 text-right text-slate-400 font-mono">
                                        {log.timestamp}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </PageContainer>
    );
}
