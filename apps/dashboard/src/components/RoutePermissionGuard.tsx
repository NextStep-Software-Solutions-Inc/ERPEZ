/**
 * RoutePermissionGuard
 * Renders children only when the current user holds the required permission(s).
 * Falls back to an AccessDenied view while loading or when access is denied.
 */
import React from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { useUnifiedAuth } from '@/auth/UnifiedAuthContext'
import { ShieldAlert } from 'lucide-react'

interface RoutePermissionGuardProps {
  /** Single permission key required, OR an array meaning "any one of these" */
  permission: string | readonly string[]
  children: React.ReactNode
  /** Optional custom message shown when access is denied */
  message?: string
}

function AccessDeniedFallback({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
      <ShieldAlert className="h-12 w-12 text-destructive opacity-70" />
      <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
      <p className="text-muted-foreground max-w-sm text-sm">
        {message ?? "You do not have permission to view this page. Contact your administrator if you believe this is an error."}
      </p>
    </div>
  )
}

export function RoutePermissionGuard({
  permission,
  children,
  message,
}: RoutePermissionGuardProps) {
  const { isSuperAdmin, hasPermission, hasAnyPermission, isLoading, isLoaded, isError, status } =
    usePermissions()
  const { tenantState, tenantId } = useUnifiedAuth()

  // SuperAdmin bypasses all guards
  if (isSuperAdmin) return <>{children}</>

  // Still resolving tenant context or loading permissions — render nothing to avoid flash
  if (tenantState === 'loading' || isLoading || (status === 'idle' && !isLoaded)) {
    return null
  }

  // Active workspace cannot be resolved or is unavailable
  if (tenantState === 'unavailable') {
    return <AccessDeniedFallback message="No active workspace available. Please select or join a workspace." />
  }

  // Error loading permissions — fail closed
  if (isError || !isLoaded) return <AccessDeniedFallback message="Unable to verify permissions. Please refresh the page." />

  const granted = Array.isArray(permission)
    ? hasAnyPermission(permission as readonly string[])
    : hasPermission(permission as string)

  if (!granted) return <AccessDeniedFallback message={message} />

  return <>{children}</>
}
