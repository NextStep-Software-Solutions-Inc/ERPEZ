import { useKeycloak } from "~/providers/KeycloakProvider";
import { GalleryVerticalEnd } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

export function SuperAdminSidebarHeader() {
  const { user } = useKeycloak();

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
          <div className="flex flex-col gap-0.5 leading-none w-auto">
            <span className="font-medium truncate max-w-[calc(100%-1rem)]">ERP Overview</span>
            <span className="text-muted-foreground truncate max-w-[calc(100%-1rem)]">{user?.username || 'Super Administrator'}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
