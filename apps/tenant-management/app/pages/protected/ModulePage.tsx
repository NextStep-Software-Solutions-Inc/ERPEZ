import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { User, ShoppingCart, NotepadText, PackageOpen, Loader2 } from "lucide-react";
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

    // Available modules from DB or fallback to initialModules
    const systemModules = React.useMemo(() => {
        if (modulesResponse?.data && modulesResponse.data.length > 0) {
            return modulesResponse.data.map(m => ({
                id: (m.key || m.name || "").toLowerCase(),
                key: (m.key || m.name || "").toLowerCase(),
                title: m.name,
                description: m.description || ""
            }));
        }
        return initialModules.map(m => ({
            id: m.id,
            key: m.id,
            title: m.title,
            description: m.description
        }));
    }, [modulesResponse]);

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
            await updateModulesMutation.mutateAsync({
                pathParams: { id: activeTenantId },
                payload: Array.from(nextKeys)
            });
            await refetchTenant();
        } catch {
            // Revert on error
            setLocalActiveKeys(activeModuleKeys);
        }
    };

    const activeCount = localActiveKeys.size;
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
                        {activeCount}/{systemModules.length}
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
                            const isEnabled = localActiveKeys.has(mod.key);
                            return (
                                <Card
                                    key={mod.key}
                                    className={`relative ${
                                        !isEnabled
                                            ? ""
                                            : "bg-gradient-to-t from-[var(--button-green)]/10 to-[var(--button-blue)]/10"
                                    }`}
                                >
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-md bg-gradient-to-tl from-[var(--button-green)]/20 to-[var(--button-blue)]/20">
                                                {mod.key === "ams" && <User className="h-6 w-6 text-blue-500" />}
                                                {(mod.key === "pbms" || mod.key === "planning") && (
                                                    <NotepadText className="h-6 w-6 text-blue-500" />
                                                )}
                                                {mod.key === "pms" && <ShoppingCart className="h-6 w-6 text-blue-500" />}
                                                {mod.key === "sams" && <PackageOpen className="h-6 w-6 text-blue-500" />}
                                            </div>

                                            <CardTitle className="text-sm font-semibold">
                                                {mod.title}
                                            </CardTitle>
                                        </div>
                                        <Switch
                                            checked={isEnabled}
                                            disabled={mod.key === "ams" || updateModulesMutation.isPending}
                                            onCheckedChange={(checked) => {
                                                toggleModule(mod.key, checked);
                                            }}
                                            aria-label={mod.key === "ams" ? `${mod.title} (disabled)` : undefined}
                                            className="data-[state=checked]:bg-blue-700"
                                        />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {mod.description}
                                        </p>
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
