import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";
import { type Tenant } from "~/features/tenant/type/Tenant";
import { planLabel, statusLabel } from "~/lib/tenant";
import { Eye } from "lucide-react";
import { useTenant } from "~/providers/TenantProvider";

interface TenantCardProps {
    id?: string;
    name?: string;
    phone?: string;
    billingContactEmail?: string;
    plan?: string;
    tenantStatus?: string;
    users?: number;
    revenue?: number;
    amount?: number;
    modules?: string[];
    tenant?: Tenant;
    isDisabled?: boolean;
    onToggleStatus?: (id: string, newDisabled: boolean) => void;
}

export function TenantCard({
    id,
    name: nameProp,
    phone,
    billingContactEmail: billingProp,
    plan: planProp,
    tenantStatus,
    users,
    revenue,
    amount, 
    modules: modulesProp,
    tenant,
    isDisabled: isDisabledProp,
    onToggleStatus,
}: TenantCardProps) {
    const navigate = useNavigate();
    const { startSpectating } = useTenant();
    const isTenantDisabled = isDisabledProp ?? tenant?.isDisabled ?? false;
    const allowedDomain = tenant?.allowedDomain ?? tenant?.tenantSetting?.allowedDomain;
    const name = tenant?.name ?? nameProp ?? "Unnamed";
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const rawPlan = tenant?.tenantSubscription?.plan ?? planProp ?? "0";
    const displayPlan = planLabel(rawPlan);
    const rawStatus = tenant?.tenantSubscription?.status ?? "0";
    const displayStatus = statusLabel(rawStatus);
    const displayAmount = tenant?.tenantSubscription?.amount ?? 0;
    const displayBilling =
        tenant?.tenantSetting?.billingContactEmail ?? billingProp ?? phone ?? "-";
    const displayModules = modulesProp ?? [];

    const statusColor =
        displayStatus === "Active"
            ? "bg-emerald-100 text-emerald-700"
            : displayStatus === "Trial"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700";

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                        {initials}
                    </div>
                    <div>
                        <CardTitle className="text-base">{name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{displayBilling}</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Access State</p>
                    <Badge className={isTenantDisabled ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"}>
                        {isTenantDisabled ? "Disabled (Disallowed)" : "Active / Allowed"}
                    </Badge>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <Badge variant="secondary">{displayPlan}</Badge>
                </div>
                {allowedDomain && (
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Domain Lock</p>
                        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {allowedDomain}
                        </span>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Users</p>
                    <p className="font-medium">{users ?? 0}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-emerald-600 font-medium">${displayAmount}/month</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Modules</p>
                    <div className="flex flex-wrap gap-2">
                        {displayModules.length > 0 ? (
                            displayModules.map((m, i) => (
                                <Badge key={i} variant="outline">
                                    {m}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No Modules</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    {onToggleStatus && id && (
                        <Button
                            variant="outline"
                            size="sm"
                            className={`flex-1 text-xs ${isTenantDisabled ? "text-emerald-700 border-emerald-300 hover:bg-emerald-50" : "text-red-700 border-red-300 hover:bg-red-50"}`}
                            onClick={() => onToggleStatus(id, !isTenantDisabled)}
                        >
                            {isTenantDisabled ? "Allow" : "Disable"}
                        </Button>
                    )}
                    {id && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 font-semibold gap-1"
                            onClick={() => {
                                startSpectating({ id, name, ...(tenant ?? {}) });
                                navigate('/overview');
                            }}
                            title="Spectate and manage this workspace"
                        >
                            <Eye className="w-3.5 h-3.5 text-amber-700" />
                            Spectate
                        </Button>
                    )}
                    <Button variant="default" size="sm" className="flex-1 text-xs" onClick={() => navigate(`/super-admin/tenant/${id}`)}>
                        Profile
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
