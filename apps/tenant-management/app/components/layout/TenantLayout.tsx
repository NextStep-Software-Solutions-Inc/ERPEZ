import { AppSidebar } from "~/components/AppSidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "~/components/ui/sidebar";
import { Outlet, useNavigate } from "react-router";
import { SearchForm } from "../SearchForm";
import TenantGuard from "./TenantGuard";
import { useTenant } from "~/providers/TenantProvider";
import { useClerkAuth } from "~/providers/ClerkAuthProvider";
import { Eye, LogOut, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function TenantLayout() {
    const { workspace, isSpectating, spectatingTenant, stopSpectating } = useTenant();
    const { isSuperAdmin } = useClerkAuth();
    const navigate = useNavigate();
    const dashboardUrl = import.meta.env.VITE_ERP_DASHBOARD_URL || "http://localhost:3000";

    const handleExitSpectating = () => {
        stopSpectating();
        if (isSuperAdmin) {
            navigate("/super-admin/tenant-management");
        } else {
            navigate("/overview");
        }
    };

    return (
        <TenantGuard>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 bg-white/80 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem />
                                </BreadcrumbList>
                            </Breadcrumb>
                            <SearchForm />
                        </div>

                        {workspace && (
                            <div className="flex items-center gap-2">
                                <a
                                    href={`${dashboardUrl}/v2/dashboard?tenantId=${workspace.id}&tenantName=${encodeURIComponent(workspace.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 h-9 px-3.5 text-xs font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-xs transition-all"
                                >
                                    <ExternalLink className="size-3.5" />
                                    <span>Open ERP Dashboard</span>
                                </a>
                            </div>
                        )}
                    </header>

                    {isSpectating && spectatingTenant && (
                        <div className="bg-amber-600 text-white px-4 py-2.5 flex items-center justify-between text-xs shadow-xs z-10">
                            <div className="flex items-center gap-2.5">
                                <span className="p-1 rounded bg-amber-700/80">
                                    <Eye className="w-4 h-4 animate-pulse text-amber-200" />
                                </span>
                                <span>
                                    <strong>SPECTATOR MODE:</strong> Spectating and managing workspace <strong>{spectatingTenant.name}</strong> ({spectatingTenant.id}) with Platform Administrator authority.
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/10 hover:bg-white/20 text-white border-white/30 h-7 text-xs font-semibold gap-1.5"
                                onClick={handleExitSpectating}
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Exit Spectator Mode
                            </Button>
                        </div>
                    )}

                    <div className="flex flex-1 flex-col gap-4 p-4 min-h-0 overflow-auto">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </TenantGuard>
    );
}