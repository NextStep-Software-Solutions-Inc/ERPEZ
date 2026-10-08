import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useUnifiedAuth } from '@/auth/UnifiedAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getTenantManagementUrl } from '@/config/env';

export const ProfileInfo = () => {
  const {
    logout,
    user,
    role,
    roles = [],
    activeRole,
    switchActiveRole,
    activeTenant,
    isSuperAdmin,
  } = useUnifiedAuth();

  const displayName = user?.displayName || user?.username || 'User';
  const email = user?.email || 'user@erpez.dev';
  const currentRole = activeRole || role || 'User';

  const initials = useMemo(() => {
    if (!displayName) return 'U';
    const parts = displayName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  // Distinct roles available to this user
  const availableRoles = useMemo(() => {
    const list = [...roles];
    if (isSuperAdmin) {
      if (!list.includes('Platform Administrator')) list.unshift('Platform Administrator');
      if (!list.includes('Tenant Administrator')) list.push('Tenant Administrator');
      if (!list.includes('System Administrator')) list.push('System Administrator');
    }
    if (list.length === 0) {
      list.push('Employee / Viewer');
    }
    return Array.from(new Set(list));
  }, [roles, isSuperAdmin]);

  const handleRoleSelect = (selectedRole: string) => {
    if (switchActiveRole) {
      switchActiveRole(selectedRole);
      toast.success(`Active role switched to ${selectedRole}`, {
        description: `Operating within bounds of ${selectedRole} in ${activeTenant?.name || 'current workspace'}.`,
      });
    }
  };

  const tenantMgmtUrl = getTenantManagementUrl();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/20 transition-all outline-none">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-md border border-white/20">
            {initials}
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-2 shadow-2xl rounded-xl border border-border" align="end">
        {/* User Identity Header */}
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
              {initials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-foreground truncate">{displayName}</span>
              <span className="text-xs text-muted-foreground truncate">{email}</span>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium text-primary border-primary/30">
                  {currentRole}
                </Badge>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        {/* Active Workspace Banner */}
        <div className="mx-1 my-1 p-2 rounded-lg bg-primary/5 border border-primary/15 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Icon icon="heroicons:building-office-2" className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider leading-none">
                Active Tenant Workspace
              </span>
              <span className="text-xs font-bold text-foreground truncate mt-0.5">
                {activeTenant?.name || 'Workspace'}
              </span>
            </div>
          </div>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium text-emerald-600 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
            Current
          </Badge>
        </div>

        <DropdownMenuSeparator className="my-1.5" />

        {/* Operating Role Switcher */}
        <div className="px-1 py-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
            <span>Roles in {activeTenant?.name || 'Workspace'}</span>
            <span className="text-[10px] font-normal text-muted-foreground/80">Scope</span>
          </div>
          <div className="space-y-1">
            {availableRoles.map((r) => {
              const isSelected = r === currentRole;
              const isPlatform = r === 'Platform Administrator';
              const isTenant = r === 'Tenant Administrator';
              const isSysAdmin = r === 'System Administrator';
              const isViewer = r === 'Employee / Viewer';

              let desc = `Standard operational access in ${activeTenant?.name || 'workspace'}`;
              let tag = '';
              if (isPlatform) {
                desc = 'Cross-tenant master control (global)';
                tag = 'Global';
              } else if (isTenant) {
                desc = `Governance, subscription & seats for ${activeTenant?.name || 'tenant'}`;
                tag = 'Account';
              } else if (isSysAdmin) {
                desc = `Full operational admin in ${activeTenant?.name || 'workspace'}`;
                tag = 'Workspace Admin';
              } else if (isViewer) {
                desc = `Simulation / read-only viewer mode in ${activeTenant?.name || 'workspace'}`;
                tag = 'Simulation';
              }

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-xs ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                      : 'hover:bg-muted/70 text-foreground'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="leading-tight font-medium">{r}</span>
                      {tag && (
                        <span className={`text-[9px] px-1 py-0.5 rounded font-normal ${
                          isSysAdmin
                            ? 'bg-primary/15 text-primary'
                            : isPlatform
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {tag}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-normal truncate mt-0.5">{desc}</span>
                  </div>
                  {isSelected && <Icon icon="heroicons:check-16-solid" className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <DropdownMenuSeparator className="my-1.5" />

        {/* Cross-Portal Navigation */}
        <DropdownMenuGroup>
          <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Navigation Portals
          </div>
          <a
            href={`${tenantMgmtUrl}/overview`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Icon icon="heroicons:building-office-2" className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span>Tenant Management Portal</span>
              <span className="text-[10px] text-muted-foreground">Seats, billing, subscription</span>
            </div>
          </a>

          {(isSuperAdmin || currentRole === 'Platform Administrator') && (
            <a
              href={`${tenantMgmtUrl}/super-admin/overview`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Icon icon="heroicons:shield-check" className="w-4 h-4 text-indigo-500" />
              <div className="flex flex-col">
                <span>Platform Admin Console</span>
                <span className="text-[10px] text-muted-foreground">All tenants & global licenses</span>
              </div>
            </a>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5" />

        {/* Sign Out */}
        <DropdownMenuItem
          onSelect={() => logout()}
          className="flex items-center gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer px-2.5 py-1.5 rounded-lg"
        >
          <Icon icon="heroicons:power" className="w-4 h-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileInfo;
