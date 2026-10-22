import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

/**
 * UACS Library Parent Route
 * Uses v2 layout system (DashboardLayoutProvider) instead of UnifiedLayout
 */
export const Route = createFileRoute('/v2/(planning)/uacs-library')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Finance.Uacs.View}
      message="You do not have permission to access the UACS Library."
    >
      <Outlet />
    </RoutePermissionGuard>
  )
}
