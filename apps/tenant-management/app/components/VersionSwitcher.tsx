import { GalleryVerticalEnd } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { useTenant } from "~/providers/TenantProvider"

export function VersionSwitcher() {
  const { tenant } = useTenant();

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
          <div className="flex flex-col gap-0.5 leading-none w-auto min-w-0">
            <span className="font-medium truncate">{tenant?.name}</span>
            <span className="text-muted-foreground truncate">{tenant?.tenantSetting?.billingContactEmail}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
