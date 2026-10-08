import * as React from "react"
import { VersionSwitcher } from "./VersionSwitcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar"
import AppSidebarFooter from "./AppSidebarFooter"
import { navigationLinks } from "~/config/navigationLinks"
import { Link, useLocation, } from "react-router"
import * as LucideIcons from "lucide-react"
import { useWorkspace } from "~/providers/TenantProvider"
import { usePermissions } from "~/hooks/usePermissions"
import { useClerkAuth } from "~/providers/ClerkAuthProvider"

export const data = {
  tenant: "Tenant Company",
  tenantOrganization: "Tenant Agency Name",
}

const getIcon = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { workspace } = useWorkspace()
  const { hasPermission } = usePermissions()
  const { isSuperAdmin } = useClerkAuth()
  const dashboardUrl = import.meta.env.VITE_ERP_DASHBOARD_URL || "http://localhost:3000"

  const activePlan = (workspace?.tenantSubscription?.plan || "Starter").toLowerCase();

  const isPlanHidden = (link: (typeof navigationLinks)[number]["items"][number]) => {
    if (!link.hiddenForPlans || link.hiddenForPlans.length === 0) return false;
    return link.hiddenForPlans.some((plan) =>
      activePlan.includes(plan.toLowerCase())
    );
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher />
        {workspace && (
          <div className="px-2 pt-1 pb-1">
            <a
              href={`${dashboardUrl}/?tenantId=${workspace.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-xs transition-all"
            >
              <LucideIcons.ExternalLink className="size-3.5" />
              <span>Open ERP Dashboard</span>
            </a>
          </div>
        )}
        {isSuperAdmin && (
          <div className="px-2 pb-1">
            <Link
              to="/super-admin/overview"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg shadow-xs transition-all"
            >
              <LucideIcons.ShieldAlert className="size-3.5" />
              <span>Super Admin Portal</span>
            </Link>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        {navigationLinks.map((item) => {
          const visibleItems = item.items.filter(
            (link) => (!link.permission || hasPermission(link.permission)) && !isPlanHidden(link)
          );
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((link) => {
                    const isActive = location.pathname === `/${link.url}`

                    return (
                      <SidebarMenuItem key={link.title}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={`/${link.url}`}
                            className={`transition-colors py-6 flex items-center gap-2 ${isActive
                              ? "text-white font-semibold rounded-lg bg-linear-to-l from-(--button-green)/70 to-(--button-blue)/70 p-4"
                              : "text-gray-700 "
                              }`}
                          >
                            {getIcon(link.icon)}
                            {link.title}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
