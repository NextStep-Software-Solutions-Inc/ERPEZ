import React, { useState } from 'react';
import { useUnifiedAuth } from '@/auth/UnifiedAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Building2, Check, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function WorkspaceSelector() {
  const {
    activeTenant,
    availableTenants,
    switchTenant,
    tenantState,
    provider,
    isSuperAdmin,
    isPlatformAdmin,
  } = useUnifiedAuth();

  const [isSwitching, setIsSwitching] = useState(false);

  const handleSelect = async (tenantId: string) => {
    if (activeTenant?.id === tenantId) return;

    try {
      setIsSwitching(true);
      await switchTenant(tenantId);
      toast.success('Switched workspace successfully');
    } catch (err: any) {
      console.error('Failed to switch workspace:', err);
      toast.error(err?.message || 'Failed to switch workspace');
    } finally {
      setIsSwitching(false);
    }
  };

  if (tenantState === 'loading' && !activeTenant) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground border rounded-md">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        <span>Loading workspace...</span>
      </div>
    );
  }

  // If user only has 1 tenant and is not a platform admin, render a clean static indicator
  if (availableTenants.length <= 1 && !isSuperAdmin && !isPlatformAdmin) {
    if (!activeTenant) return null;
    return (
      <div className="flex items-center gap-2 max-w-[240px] h-9 px-3 border border-border/80 bg-card text-card-foreground rounded-md shadow-xs text-xs font-medium">
        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="truncate text-left font-semibold">{activeTenant.name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isSwitching}
          className="flex items-center gap-2 max-w-[220px] h-9 px-3 border border-border/80 bg-card hover:bg-accent text-card-foreground shadow-xs text-xs font-medium"
        >
          {isSwitching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
          ) : (
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
          <span className="truncate text-left flex-1">
            {activeTenant?.name || 'Select Workspace'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] z-50">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Workspaces ({availableTenants.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {availableTenants.length === 0 ? (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            No authorized workspaces available
          </div>
        ) : (
          availableTenants.map((tenant) => {
            const isSelected = activeTenant?.id === tenant.id;
            return (
              <DropdownMenuItem
                key={tenant.id}
                onClick={() => handleSelect(tenant.id)}
                className="flex items-center justify-between cursor-pointer text-xs py-2"
              >
                <div className="flex flex-col truncate pr-2">
                  <span className="font-medium truncate">{tenant.name}</span>
                  {tenant.slug && (
                    <span className="text-[10px] text-muted-foreground truncate">
                      {tenant.slug}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
              </DropdownMenuItem>
            );
          })
        )}

        {provider === 'clerk' && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-[10px] text-muted-foreground text-center">
              Managed via Clerk Organizations
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WorkspaceSelector;
