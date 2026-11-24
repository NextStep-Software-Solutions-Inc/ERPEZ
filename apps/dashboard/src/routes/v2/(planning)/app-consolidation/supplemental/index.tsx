import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(planning)/app-consolidation/supplemental/')({
  component: SupplementalLayout,
})

function SupplementalLayout() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.App.Manage}
      message="You do not have permission to access Supplemental APPs."
    >
      <Outlet />
    </RoutePermissionGuard>
  )
}
