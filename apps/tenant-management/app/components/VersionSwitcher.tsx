import { Building2, ChevronsUpDown, Check, AlertCircle, Loader2, LogOut } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useWorkspace } from "~/providers/TenantProvider";
import { useClerkAuth } from "~/providers/ClerkAuthProvider";

export function VersionSwitcher() {
  const { workspace, workspaces, selectWorkspace, isLoading, userWorkspaceRoles, isSpectating, stopSpectating } = useWorkspace();
  const { isSuperAdmin } = useClerkAuth();

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 p-3 text-xs text-slate-500">
            <Loader2 className="size-4 animate-spin text-blue-600" />
            <span>Loading workspaces...</span>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!workspace || workspaces.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 p-2.5 text-xs text-amber-800 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="size-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold block">No workspace access</span>
              <span className="text-[11px] text-amber-700">Contact your administrator</span>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const rawRole = userWorkspaceRoles[0] || (workspace as any)?.tenantMembers?.[0]?.role || "Member";
  const displayRole = rawRole === "Tenant Administrator" ? "Workspace Administrator" : rawRole;
  const activePlan = workspace?.tenantSubscription?.plan || "Starter";

  // If user belongs to only 1 workspace and is not super admin/spectating, show a clean static display without interactive dropdown
  if (workspaces.length <= 1 && !isSuperAdmin && !isSpectating) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="cursor-default hover:bg-transparent"
          >
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white flex aspect-square size-9 items-center justify-center rounded-lg shadow-xs shrink-0">
              <Building2 className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none min-w-0 flex-1 text-left">
              <span className="font-semibold text-slate-900 text-sm truncate">{workspace.name}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 font-medium rounded border border-blue-200 shrink-0">
                  {activePlan}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">{displayRole}</span>
              </div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Multiple workspaces or platform admin / spectator: show full workspace switcher dropdown
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-slate-100 transition-colors"
            >
              <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white flex aspect-square size-9 items-center justify-center rounded-lg shadow-xs shrink-0">
                <Building2 className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none min-w-0 flex-1 text-left">
                <span className="font-semibold text-slate-900 text-sm truncate">{workspace.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 font-medium rounded border border-blue-200 shrink-0">
                    {activePlan}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate">{displayRole}</span>
                </div>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-slate-400 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-72 rounded-xl p-1.5 shadow-xl border-slate-200"
            align="start"
            side="bottom"
            sideOffset={6}
          >
            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Switch Workspace ({workspaces.length})
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-slate-100" />
            {workspaces.map((w) => {
              const isCurrent = w.id === workspace.id;
              const wPlan = w.tenantSubscription?.plan || "Starter";
              const rawMemberRole = (w as any).tenantMembers?.[0]?.roles?.[0] || (w as any).tenantMembers?.[0]?.role || "Member";
              const wRole = rawMemberRole === "Tenant Administrator" ? "Workspace Administrator" : rawMemberRole;

              return (
                <DropdownMenuItem
                  key={w.id}
                  onClick={() => selectWorkspace(w.id)}
                  className={`flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    isCurrent ? "bg-blue-50 text-blue-900 font-medium" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`size-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurrent ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {w.name ? w.name[0].toUpperCase() : "W"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-slate-900 truncate">{w.name}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-medium text-slate-600">{wPlan}</span>
                        <span>&bull;</span>
                        <span className="truncate">{wRole}</span>
                      </div>
                    </div>
                  </div>
                  {isCurrent && (
                    <Check className="size-4 text-blue-600 shrink-0 ml-2" />
                  )}
                </DropdownMenuItem>
              );
            })}
            {(isSuperAdmin || isSpectating) && (
              <>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                {isSpectating && (
                  <DropdownMenuItem
                    onClick={() => {
                      stopSpectating();
                      window.location.href = "/super-admin/tenant-management";
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-amber-700 hover:bg-amber-50 text-xs font-semibold"
                  >
                    <LogOut className="size-3.5" />
                    <span>Exit Spectator Mode</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/super-admin/tenant-management";
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-blue-700 hover:bg-blue-50 text-xs font-semibold"
                >
                  <Building2 className="size-3.5" />
                  <span>All Platform Workspaces</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
