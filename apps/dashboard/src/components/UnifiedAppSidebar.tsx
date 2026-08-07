import * as React from 'react'
import * as LucideIcons from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import { VersionSwitcher } from './VersionSwitcher'
import UnifiedAppSidebarFooter from './UnifiedAppSidebarFooter'
import type { FileRoutesByTo } from '@/routeTree.gen'
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
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export interface NavigationLink {
  title: string
  url?: keyof FileRoutesByTo | string
  icon: string
}

export interface NavigationGroup {
  title: string
  url?: keyof FileRoutesByTo | string
  items: Array<NavigationLink>
}

interface UnifiedAppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navigationLinks: Array<NavigationGroup>
  tenant: string
  tenantOrganization: string
}

const getIcon = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName]
  return IconComponent ? <IconComponent className="w-4 h-4" /> : null
}

export function UnifiedAppSidebar({
  navigationLinks,
  tenant,
  tenantOrganization,
  ...props
}: UnifiedAppSidebarProps) {
  const location = useLocation()

  // Find the most specific active link (longest URL match)
  const activeLink =
    navigationLinks
      .flatMap((group) => group.items)
      .filter((link) => link.url && location.pathname.startsWith(link.url))
      .sort((a, b) => (b.url?.length || 0) - (a.url?.length || 0))[0] || null

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          tenant={tenant}
          tenantOrganization={tenantOrganization}
        />
      </SidebarHeader>
      <SidebarContent>
        {navigationLinks.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((link) => {
                  const isActive = activeLink === link
                  return (
                    <SidebarMenuItem key={link.title}>
                      {link.url ? (
                        <SidebarMenuButton asChild>
                          <Link
                            to={link.url}
                            className={cn(
                              `transition-colors py-6 flex items-center gap-2 text-gray-700`,
                              {
                                'text-white rounded-lg bg-linear-to-l from-(--button-green)/70 to-(--button-blue)/70':
                                  isActive,
                              },
                            )}
                          >
                            {getIcon(link.icon)}
                            {link.title}
                          </Link>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton className="transition-colors py-6 flex items-center gap-2 text-gray-700">
                          {getIcon(link.icon)}
                          {link.title}
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <UnifiedAppSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
