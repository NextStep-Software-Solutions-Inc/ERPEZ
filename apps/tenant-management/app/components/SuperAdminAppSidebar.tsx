import * as React from "react"
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
import { superAdminNavigationLinks } from "~/config/superAdminNavigationLinks"
import { Link, useLocation } from "react-router"
import { SuperAdminSidebarHeader } from "./SuperAdminSidebarHeader"
import { usePermissions } from "~/hooks/usePermissions"
import { useClerkAuth } from "~/providers/ClerkAuthProvider"
import { ArrowLeft } from "lucide-react"
import * as LucideIcons from "lucide-react"

const getIcon = (iconName?: string) => {
  if (!iconName) return null;
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent ? <IconComponent className="w-4 h-4 shrink-0" /> : null;
};

export function SuperAdminAppSidebar({ tenant, tenantOrganization, ...props }: { tenant?: string; tenantOrganization?: string } & React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { hasPermission, isPlatformAdmin } = usePermissions()
  const { isSuperAdmin } = useClerkAuth()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SuperAdminSidebarHeader />
        <div className="px-2 pt-1 pb-1">
          <Link
            to="/overview"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Workspace</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {superAdminNavigationLinks.map((item) => {
          const visibleItems = item.items.filter(
            (link) => isSuperAdmin || isPlatformAdmin || !link.permission || hasPermission(link.permission)
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
                            className={`transition-colors py-6 flex items-center gap-3 ${isActive
                              ? "text-white font-semibold rounded-lg bg-linear-to-l from-(--button-green)/70 to-(--button-blue)/70 p-4"
                              : "text-gray-700 hover:bg-slate-100"
                              }`}
                          >
                            {getIcon(link.icon)}
                            <span>{link.title}</span>
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
