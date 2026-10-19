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
import { Eye, LogOut } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function TenantLayout() {
    const { isSpectating, spectatingTenant, stopSpectating } = useTenant();
    const { isSuperAdmin } = useClerkAuth();
    const navigate = useNavigate();

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
                    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/80 backdrop-blur-sm">
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