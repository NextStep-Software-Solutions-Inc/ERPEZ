import { GalleryVerticalEnd } from 'lucide-react'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const NO_TENANT = 'No Tenant'
const NO_ORGANIZATION = 'No Organization'

export function VersionSwitcher({
  tenant,
  tenantOrganization,
}: {
  tenant?: string
  tenantOrganization?: string
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">{tenant || NO_TENANT}</span>
            <span className="text-muted-foreground">
              {tenantOrganization || NO_ORGANIZATION}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
