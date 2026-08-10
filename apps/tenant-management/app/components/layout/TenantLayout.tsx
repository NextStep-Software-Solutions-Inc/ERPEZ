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
import { Outlet } from "react-router";
import { SearchForm } from "../SearchForm";
import TenantGuard from "./TenantGuard";


export default function TenantLayout() {

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
                    <div className="flex flex-1 flex-col gap-4 p-4 min-h-0 overflow-auto">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </TenantGuard>
    );
}