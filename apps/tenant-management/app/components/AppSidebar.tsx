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

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher />
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
