import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { User, ShoppingCart, NotepadText, PackageOpen, Loader2, Clock } from "lucide-react";
import { Switch } from "~/components/ui/switch";
import React from "react";
import { PageContainer } from "~/components/PageContainer";
import { createMutationHookFromTemplate, createQueryHookFromTemplate } from "erpez-shared-lib";
import { getModulesRequest } from "~/features/module/handlers/getModulesRequest";
import { getTenantRequest } from "~/features/tenant/handlers/getTenantRequest";
import { updateTenantModulesRequest } from "~/features/module/handlers/updateTenantModulesRequest";
import { useTenant } from "~/providers/TenantProvider";
import { initialModules } from "~/data/module/initialModule";
import { toast } from "sonner";

interface ModuleMeta {
    title: string;
    description: string;
    isComingSoon?: boolean;
    order: number;
}

const MODULE_METADATA: Record<string, ModuleMeta> = {
    ams: {
        title: "Account Management System",
        description: "Manages user accounts, organizational hierarchy, roles, and access control across the system.",
        isComingSoon: false,
        order: 1,
    },
    pbms: {
        title: "Planning and Budget Management System",
        description: "Handles strategic planning, annual budget preparation, performance KPIs, and commitment controls.",
        isComingSoon: false,
        order: 2,
    },
    planning: {
        title: "Planning and Budget Management System",
        description: "Handles strategic planning, annual budget preparation, performance KPIs, and commitment controls.",
        isComingSoon: false,
        order: 2,
    },
    pms: {
        title: "Procurement Management System",
        description: "Covers the procurement lifecycle from purchase requests (PR) and RFQ bidding to BAC awards and purchase orders.",
        isComingSoon: false,
        order: 3,
    },
    sams: {
        title: "Supply and Asset Management System",
        description: "Manages inventory, stock monitoring, and issuance of supplies and assets throughout their lifecycle.",
        isComingSoon: true,
        order: 4,
    },
};

const useAllModules = createQueryHookFromTemplate(getModulesRequest);
const useTenantDetails = createQueryHookFromTemplate(getTenantRequest);
const useUpdateTenantModules = createMutationHookFromTemplate(updateTenantModulesRequest);

export default function ModulePage() {
    const { tenant } = useTenant();
    const activeTenantId = tenant?.id || "";

    const { data: modulesResponse, isLoading: isLoadingModules } = useAllModules({
        pathParams: {},
        queryParams: { pageSize: 50, pageNumber: 1 }
    });

    const { data: tenantDetailsResponse, isLoading: isLoadingTenant, refetch: refetchTenant } = useTenantDetails({
        pathParams: { id: activeTenantId },
        queryParams: {}
    });

    const updateModulesMutation = useUpdateTenantModules();

    // Available modules enriched with curated metadata, ordered deterministically
    const systemModules = React.useMemo(() => {
        const raw = (modulesResponse?.data && modulesResponse.data.length > 0)
            ? modulesResponse.data.map(m => {
                const key = (m.key || m.name || "").toLowerCase();
                const meta = MODULE_METADATA[key];
                return {
                    id: key,
                    key,
                    title: meta?.title || m.name,
                    description: meta?.description || m.description || "",
                    isComingSoon: Boolean(meta?.isComingSoon),
                    order: meta?.order ?? 99,
                };
            })
            : initialModules.map(m => {
                const key = m.id.toLowerCase();
                const meta = MODULE_METADATA[key];
                return {
                    id: key,
                    key,
                    title: meta?.title || m.title,
                    description: meta?.description || m.description,
                    isComingSoon: Boolean(meta?.isComingSoon),
                    order: meta?.order ?? 99,
                };
            });

        // Ensure SAMS is always represented as Coming Soon if not returned by backend
        const presentKeys = new Set(raw.map(m => m.key));
        if (!presentKeys.has("sams")) {
            raw.push({
                id: "sams",
                key: "sams",
                title: MODULE_METADATA.sams.title,
                description: MODULE_METADATA.sams.description,
                isComingSoon: true,
                order: MODULE_METADATA.sams.order,
            });
        }

        return raw.sort((a, b) => a.order - b.order);
    }, [modulesResponse]);

    // Operational modules (excluding Coming Soon roadmap modules)
    const operationalModules = React.useMemo(() => {
        return systemModules.filter(m => !m.isComingSoon);
    }, [systemModules]);

    // Active module keys for this tenant from backend
    const activeModuleKeys = React.useMemo(() => {
        const tenantModules = tenantDetailsResponse?.data?.modules || tenant?.modules;
        if (tenantModules && tenantModules.length > 0) {
            return new Set(tenantModules.map(m => m.key.toLowerCase()));
        }
        // Fallback default: ams is always enabled
        return new Set(["ams"]);
    }, [tenantDetailsResponse, tenant]);

    const [localActiveKeys, setLocalActiveKeys] = React.useState<Set<string>>(new Set(["ams"]));

    React.useEffect(() => {
        setLocalActiveKeys(new Set(activeModuleKeys));
    }, [activeModuleKeys]);

    const toggleModule = async (key: string, checked: boolean) => {
        if (key === "ams") {
            toast.info("Account Management System (AMS) is a core module and cannot be disabled.");
            return;
        }

        if (key === "sams") {
            toast.info("Supply and Asset Management System (SAMS) is in active development.");
            return;
        }

        const nextKeys = new Set(localActiveKeys);
        if (checked) {
            nextKeys.add(key);
        } else {
            nextKeys.delete(key);
        }
        nextKeys.add("ams"); // AMS is always preserved

        setLocalActiveKeys(nextKeys);

        if (!activeTenantId) return;

        try {
            // Only submit operational keys to backend
            const payloadKeys = Array.from(nextKeys).filter(k => k !== "sams");
            await updateModulesMutation.mutateAsync({
                pathParams: { id: activeTenantId },
                payload: payloadKeys
            });
            await refetchTenant();
        } catch {
            // Revert on error
            setLocalActiveKeys(activeModuleKeys);
        }
    };

    // Calculate active operational modules (e.g., 3/3)
    const activeOperationalCount = operationalModules.filter(m => localActiveKeys.has(m.key)).length;
    const isLoading = isLoadingModules || isLoadingTenant;

    return (
        <PageContainer
            title="Module Management"
            description="List of modules that your organization needs."
            action={
                <div className="text-sm font-medium px-4 flex items-center gap-2">
                    {updateModulesMutation.isPending && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                    <span>Active Modules</span>{" "}
                    <span className="text-blue-600 font-semibold">
                        {activeOperationalCount}/{operationalModules.length}
                    </span>
                </div>
            }>
            <div className="flex flex-col gap-10">
                <div
                    className="rounded-lg bg-gradient-to-l from-[var(--button-green)]/40 to-[var(--button-blue)]/40 p-4"
                    style={{ borderLeft: "8px solid #2563EB66" }}
                >
                    <span className="justify-start text-blue-900 text-base font-bold font-['Inter'] leading-loose block">
                        Module Overview
                    </span>
                    <p className="text-sm text-[#1E3A8A]">
                        Choose from our comprehensive suite of business management modules.
                        Each module integrates seamlessly with others to provide a complete ERP solution.
                    </p>
                </div>
                {isLoading && systemModules.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                        {systemModules.map((mod) => {
                            const isEnabled = localActiveKeys.has(mod.key) && !mod.isComingSoon;
                            const isComingSoon = mod.isComingSoon;

                            return (
                                <Card
                                    key={mod.key}
                                    className={`relative transition-all duration-200 ${
                                        isComingSoon
                                            ? "border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-50"
                                            : !isEnabled
                                            ? "border-slate-200"
                                            : "border-blue-200/60 bg-gradient-to-t from-[var(--button-green)]/10 to-[var(--button-blue)]/10 shadow-xs"
                                    }`}
                                >
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`h-10 w-10 flex items-center justify-center rounded-lg ${
                                                    isComingSoon
                                                        ? "bg-amber-100/70 text-amber-700"
                                                        : "bg-gradient-to-tl from-[var(--button-green)]/20 to-[var(--button-blue)]/20 text-blue-600"
                                                }`}
                                            >
                                                {mod.key === "ams" && <User className="h-5 w-5" />}
                                                {(mod.key === "pbms" || mod.key === "planning") && (
                                                    <NotepadText className="h-5 w-5" />
                                                )}
                                                {mod.key === "pms" && <ShoppingCart className="h-5 w-5" />}
                                                {mod.key === "sams" && <PackageOpen className="h-5 w-5" />}
                                            </div>

                                            <CardTitle className="text-sm font-semibold text-slate-900">
                                                {mod.title}
                                            </CardTitle>
                                        </div>

                                        {isComingSoon ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
                                                <Clock className="w-3 h-3 text-amber-600" />
                                                Coming Soon
                                            </span>
                                        ) : (
                                            <Switch
                                                checked={isEnabled}
                                                disabled={mod.key === "ams" || updateModulesMutation.isPending}
                                                onCheckedChange={(checked) => {
                                                    toggleModule(mod.key, checked);
                                                }}
                                                aria-label={mod.key === "ams" ? `${mod.title} (disabled)` : undefined}
                                                className="data-[state=checked]:bg-blue-700"
                                            />
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-0">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {mod.description}
                                        </p>
                                        {isComingSoon && (
                                            <div className="flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded-md px-3 py-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                                <span>In active development · Scheduled for an upcoming release</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
