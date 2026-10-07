import { SuperAdminAppSidebar } from "~/components/SuperAdminAppSidebar";  // Adjust path if needed (e.g., to "@/components/app-sidebar")
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "~/components/ui/sidebar";
import { Link, Outlet, useLocation } from "react-router";
import { SearchForm } from "../SearchForm";
import SuperAdminGuard from "./SuperAdminGuard";


function generateBreadcrumbs(pathname: string) {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
        let href = "/" + segments.slice(0, index + 1).join("/");
        if (href === "/super-admin") {
            href = "/super-admin/overview";
        }
        const label = segment
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
        return { label, href };
    });
    return breadcrumbs;
}

export default function SuperAdminLayout() {
    const location = useLocation();
    const breadcrumbs = generateBreadcrumbs(location.pathname);
    return (
        <SuperAdminGuard>
            <SidebarProvider>
                <SuperAdminAppSidebar />
                <SidebarInset>
                    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/80 backdrop-blur-sm">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((crumb, index) => (
                                    <div key={crumb.href} className="flex items-center">
                                        {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                                        <BreadcrumbItem className="hidden md:block">
                                            {index === breadcrumbs.length - 1 ? (
                                                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink asChild>
                                                    <Link to={crumb.href}>{crumb.label}</Link>
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                    </div>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                        <SearchForm />
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 min-h-0 overflow-auto">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </SuperAdminGuard>
    )
}