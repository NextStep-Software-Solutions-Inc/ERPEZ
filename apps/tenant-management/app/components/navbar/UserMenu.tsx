import React from 'react';
import { useNavigate } from 'react-router';
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
import { LogOut, Shield, Building, UserCheck, ShieldAlert, SlidersHorizontal, Coins } from 'lucide-react';

interface UserMenuProps {
  className?: string;
  showDetails?: boolean;
}

export function UserMenu({ className = '', showDetails = true }: UserMenuProps) {
  const { user, isSuperAdmin, logout, switchDevUser, activeDevUser } = useKeycloak();
  const navigate = useNavigate();

  const handleSwitchUser = async (newUsername: string) => {
    await switchDevUser(newUsername);
    if (newUsername.startsWith('dev_superadmin') || newUsername.startsWith('dev_platform')) {
      navigate('/super-admin/overview');
    } else {
      navigate('/overview');
    }
  };

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
            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1 pb-0.5">
              DEV PERSONA SWITCHER
            </DropdownMenuLabel>

            <div className="px-2 py-0.5 text-[9px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 rounded mx-1 mt-1">
              Platform Personas
            </div>
            <DropdownMenuItem
              onClick={() => handleSwitchUser('dev_superadmin')}
              className={`text-xs cursor-pointer ${activeDevUser === 'dev_superadmin' ? 'font-semibold bg-purple-50 text-purple-900' : ''}`}
            >
              <ShieldAlert className="mr-2 h-3.5 w-3.5 text-purple-600" />
              <span>Platform Administrator</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSwitchUser('dev_platform_auditor')}
              className={`text-xs cursor-pointer ${activeDevUser === 'dev_platform_auditor' ? 'font-semibold bg-amber-50 text-amber-900' : ''}`}
            >
              <Shield className="mr-2 h-3.5 w-3.5 text-amber-600" />
              <span>Platform Auditor</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSwitchUser('dev_platform_support')}
              className={`text-xs cursor-pointer ${activeDevUser === 'dev_platform_support' ? 'font-semibold bg-blue-50 text-blue-900' : ''}`}
            >
              <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-blue-600" />
              <span>Platform Support</span>
            </DropdownMenuItem>

            <div className="px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 rounded mx-1 mt-1.5">
              Workspace Personas
            </div>
            <DropdownMenuItem
              onClick={() => handleSwitchUser('dev_admin')}
              className={`text-xs cursor-pointer ${activeDevUser === 'dev_admin' ? 'font-semibold bg-accent' : ''}`}
            >
              <Building className="mr-2 h-3.5 w-3.5 text-orange-500" />
              <span>Workspace Admin</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSwitchUser('dev_planner')}
              className={`text-xs cursor-pointer ${activeDevUser === 'dev_planner' ? 'font-semibold bg-accent' : ''}`}
            >
              <UserCheck className="mr-2 h-3.5 w-3.5 text-blue-500" />
              <span>Planning Officer</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSwitchUser('dev_finance')}
              className={`text-xs cursor-pointer ${activeDevUser === 'dev_finance' ? 'font-semibold bg-accent' : ''}`}
            >
              <Coins className="mr-2 h-3.5 w-3.5 text-emerald-500" />
              <span>Finance Officer</span>
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
