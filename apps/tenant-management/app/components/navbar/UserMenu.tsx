import React from 'react';
import { useKeycloak } from '~/providers/KeycloakProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { LogOut, Shield, Building, UserCheck } from 'lucide-react';

interface UserMenuProps {
  className?: string;
  showDetails?: boolean;
}

export function UserMenu({ className = '', showDetails = true }: UserMenuProps) {
  const { user, isSuperAdmin, logout, switchDevUser, activeDevUser } = useKeycloak();

  if (!user) {
    return null;
  }

  const displayName = user.displayName || user.username || 'User';
  const email = user.email || 'user@erpez.dev';
  const roleLabel = isSuperAdmin ? 'Super Administrator' : user.role || 'Tenant Admin';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left outline-none ${className}`}
        >
          <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700 shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {showDetails && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground truncate">{email}</span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-2 shadow-xl">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
              <Shield className="h-3 w-3" />
              <span>{roleLabel}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {import.meta.env.DEV && (
          <>
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Dev Persona Switcher
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => switchDevUser('dev_admin')}
              className={`text-xs cursor-pointer ${activeDevUser === 'dev_admin' ? 'font-semibold bg-accent' : ''}`}
            >
              <Building className="mr-2 h-3.5 w-3.5 text-orange-500" />
              <span>Tenant Admin</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchDevUser('dev_superadmin')}
              className={`text-xs cursor-pointer ${activeDevUser === 'dev_superadmin' ? 'font-semibold bg-accent' : ''}`}
            >
              <Shield className="mr-2 h-3.5 w-3.5 text-rose-500" />
              <span>Super Administrator</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchDevUser('dev_planner')}
              className={`text-xs cursor-pointer ${activeDevUser === 'dev_planner' ? 'font-semibold bg-accent' : ''}`}
            >
              <UserCheck className="mr-2 h-3.5 w-3.5 text-blue-500" />
              <span>Planning Officer</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          onClick={() => logout()}
          className="text-xs text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
