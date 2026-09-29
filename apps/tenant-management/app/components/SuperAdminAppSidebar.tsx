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
import { Link, useLocation, } from "react-router"
import { SuperAdminSidebarHeader } from "./SuperAdminSidebarHeader"
import { usePermissions } from "~/hooks/usePermissions"

export function SuperAdminAppSidebar({ tenant, tenantOrganization, ...props }: { tenant?: string; tenantOrganization?: string } & React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { hasPermission, isPlatformAdmin } = usePermissions()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SuperAdminSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        {superAdminNavigationLinks.map((item) => {
          const visibleItems = item.items.filter(
            (link) => isPlatformAdmin || !link.permission || hasPermission(link.permission)
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
                            className={`transition-colors py-6 ${isActive
                              ? "text-white font-semibold rounded-lg bg-linear-to-l from-(--button-green)/70 to-(--button-blue)/70 p-4"
                              : "text-gray-700 "
                              }`}
                          >
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
