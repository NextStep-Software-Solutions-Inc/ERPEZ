import { CalendarFold, Clock, Crown, Download, FolderKey, LayoutDashboard, Shield, Zap } from "lucide-react"
import OverviewRecentActivity from "~/components/OverviewRecentActivity"
import { PageContainer } from "~/components/PageContainer"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { buildCards, type CardItem } from "~/data/overview/cards"
import { buildQuickActions } from "~/data/overview/quickActions"
import { useNavigate } from "react-router"
import { useTenant } from "~/providers/TenantProvider"
import { useBillingData } from "~/features/billing/hooks/useBillingData"
import { createQueryHookFromTemplate } from "erpez-shared-lib"
import { getTenantLicenseRequest } from "~/features/license/handlers/getTenantLicenseRequest"

import { planLabel } from "~/lib/tenant"
import { getDashboardUrl } from "~/config/env"

const useTenantLicense = createQueryHookFromTemplate(getTenantLicenseRequest);

export default function OverviewPage() {
    const navigate = useNavigate();
    const { tenant } = useTenant();
    const { data: billingData } = useBillingData();
    const tenantId = tenant?.id;

    const { data: licenseResponse } = useTenantLicense({
        pathParams: { id: tenantId || "" },
        queryParams: { domain: typeof window !== "undefined" ? window.location.hostname : "" },
    });

    const license = licenseResponse?.data;
    const subscription = billingData?.subscription;

    const rawPlan = subscription?.planName || tenant?.tenantSubscription?.plan;
    const planName = planLabel(rawPlan);
    const hasLicense = Boolean(license && license.remainingDays != null);
    const licenseDays = hasLicense ? license!.remainingDays : null;
    const status = {
        label: tenant?.isDisabled ? "Inactive" : "Active",
        color: tenant?.isDisabled ? "red" : "green",
    };
    const lastUpdated = "Today";
    const licenseHint = hasLicense
        ? `Valid until ${new Date(license!.expiresAt).toLocaleDateString()}`
        : "Standard cloud subscription active";

    const cards = buildCards({
        licenseDays,
        licenseDisplay: hasLicense ? `${licenseDays} days` : "Cloud SaaS",
        planName,
        statusLabel: status.label,
        statusColor: status.color,
        lastUpdated,
        licenseHint,
    });

    const quickActions = buildQuickActions()
    const handleAction = (id: string) => { 
        switch (id) {
            case "upgrade":
                navigate("/plan")
                break
            case "erp": {
                const targetTenantId = tenant?.id;
                const rawBase = tenant?.tenantSetting?.baseURL?.trim();
                const isApiUrl = rawBase && (rawBase.includes(':5245') || rawBase.includes(':5246') || rawBase.includes('.api.'));
                const dedicatedBase = (rawBase && !isApiUrl) ? rawBase : getDashboardUrl();
                const tenantSlug = (tenant as any)?.slug || tenant?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const slugParam = tenantSlug ? `&slug=${encodeURIComponent(tenantSlug)}` : '';
                window.open(`${dedicatedBase}/v2/dashboard?tenantId=${targetTenantId}${slugParam}`, "_blank");
                break;
            }
            case "license":
                navigate("/license-management")
                break
            case "downloads":
                navigate("/package-download")
                break
        }
    }


    return (
        <PageContainer
            title="Overview"
            description="Welcome back! Manage your tenant operations."
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((c: CardItem) => (
                    <Card key={c.id} className="hover:shadow-md transition flex flex-col gap-5" aria-labelledby={`card-${c.id}`}>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                            {c.iconKey === "calendar" && <CalendarFold className="h-5 w-5 text-muted-foreground" />}
                            {c.iconKey === "badge" && <Zap className="h-5 w-5 text-muted-foreground" />}
                            {c.iconKey === "circle" && <Shield className="h-5 w-5 text-muted-foreground" />}
                            {c.iconKey === "clock" && <Clock className="h-5 w-5 text-muted-foreground" />}
                        </CardHeader>
                        <CardContent>
                            {c.value.type === "text" ? (
                                <p className="text-2xl font-bold">{c.value.value}</p>
                            ) : (

                                    <div className="flex items-center justify-start">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-3 w-3 rounded-full bg-green-700`} />
                                            <p className="text-2xl font-bold m-0 text-green-700">{c.value.label}</p>
                                        </div>
                                    </div>
                            )}
                            {c.hint && <p className="text-xs text-muted-foreground mt-2">{c.hint}</p>}
                            {c.actionKey === "upgrade" && (
                                <div className="mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAction?.("upgrade")}
                                        className="cursor-pointer flex items-center justify-center rounded-md border-2 
                                                    border-transparent bg-white 
                                                    [background:linear-gradient(white,white)padding-box,linear-gradient(to_right,var(--button-green),var(--button-blue))border-box]"
                                    >
                                        <Crown className="h-5 w-5 mr-2 text-[var(--button-green)]" /> Upgrade
                                    </Button>
                                </div>


                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="pt-8">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickActions.map((a) => (
                        <Card key={a.id} className="hover:shadow-md transition" role="region" aria-labelledby={`qa-${a.id}`}>
                            <CardContent className="flex flex-col items-center justify-center gap-4">
                                <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-gradient-to-br from-[var(--button-blue)]/30 to-[var(--button-green)]/30">
                                    {a.iconKey === "crown" && <Crown className="h-5 w-5 text-[var(--button-blue)]" />}
                                    {a.iconKey === "layout-dashboard" && <LayoutDashboard className="h-5 w-5 text-[var(--button-blue)]" />}
                                    {a.iconKey === "folder-key" && <FolderKey className="h-5 w-5 text-[var(--button-blue)]" />}
                                    {a.iconKey === "downloads" && <Download className="h-5 w-5 text-[var(--button-blue)]" />}
                                </div>
                                <div className="flex flex-col items-center text-center justify-center text-balance">
                                    <h3 id={`qa-${a.id}`} className="font-semibold mb-3">{a.title}</h3>
                                    <p id={`qa-desc-${a.id}`} className="text-sm text-muted-foreground">{a.description}</p>
                                </div>
                                <Button
                                    variant={a.button.variant as any}
                                    onClick={() => handleAction(a.id)}
                                    aria-label={a.button.label}
                                    className={`cursor-pointer ${a.id === "upgrade" || a.id === "erp"
                                        ? "bg-gradient-to-l from-[var(--button-green,#10B981)]/70 to-[var(--button-blue,#3B82F6)]/70 text-white"
                                        : ""
                                        }`}
                                >
                                    {a.button.label}
                                </Button>

                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <OverviewRecentActivity />
        </PageContainer>
    )
}
