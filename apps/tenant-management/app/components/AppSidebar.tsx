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
  const dashboardUrl = import.meta.env.VITE_ERP_DASHBOARD_URL || "http://localhost:3000"

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
      </SidebarHeader>
      <SidebarContent>
        {navigationLinks.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((link) => {
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
        ))}
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
