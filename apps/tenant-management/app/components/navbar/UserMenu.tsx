import React from 'react';
import { useClerkAuth } from '~/providers/ClerkAuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { LogOut, Shield, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

interface UserMenuProps {
  className?: string;
  showDetails?: boolean;
}

export function UserMenu({ className = '', showDetails = true }: UserMenuProps) {
  const { user, isSuperAdmin, logout, toggleSuperAdminOverride } = useClerkAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const displayName = user.displayName || user.username || 'User';
  const email = user.email || 'user@erpez.dev';
  const roleLabel = isSuperAdmin ? 'Super Administrator' : user.role || 'Member';
  const isSuperAdminView = location.pathname.startsWith('/super-admin');

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

      <DropdownMenuContent align="end" className="w-60 p-2 shadow-xl">
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

        {/* Portal Switcher */}
        {isSuperAdmin ? (
          <DropdownMenuItem
            onClick={() => {
              if (isSuperAdminView) {
                navigate('/overview');
              } else {
                navigate('/super-admin/overview');
              }
            }}
            className="text-xs cursor-pointer font-medium text-blue-600 focus:bg-blue-50 focus:text-blue-700 py-2"
          >
            <ArrowRightLeft className="mr-2 h-3.5 w-3.5" />
            <span>
              {isSuperAdminView
                ? 'Switch to Tenant Workspace'
                : 'Switch to Super Admin Portal'}
            </span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => {
              if (toggleSuperAdminOverride) {
                toggleSuperAdminOverride(true);
              } else {
                localStorage.setItem('erpez_is_super_admin', 'true');
                window.location.href = '/super-admin/overview';
              }
            }}
            className="text-xs cursor-pointer font-medium text-purple-700 hover:text-purple-800 focus:bg-purple-50 py-2"
          >
            <ShieldCheck className="mr-2 h-3.5 w-3.5 text-purple-600" />
            <span>Enable Super Admin Access</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

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
