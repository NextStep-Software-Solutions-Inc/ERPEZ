import { ChevronUpIcon, LogOutIcon, UserIcon } from 'lucide-react'
import { useKeycloak } from '@/providers/KeycloakProvider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * SidebarFooter
 * - Shows user name, email and logout option in a dropdown
 */
export default function UnifiedAppSidebarFooter({
  className = '',
}: {
  className?: string
}) {
  const { logout, userName, email, firstName, lastName } = useKeycloak()

  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : userName || email || 'User'

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={`w-full ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group flex w-full items-center gap-3 px-3 py-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-slate-50 dark:bg-slate-800 shadow-sm transition-transform group-hover:scale-105">
              <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {displayName}
              </span>
              {email && (
                <span className="text-xs text-gray-500 truncate">{email}</span>
              )}
            </div>
            <ChevronUpIcon className="h-4 w-4 text-gray-400 transition-transform group-hover:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              {email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600"
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
