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
