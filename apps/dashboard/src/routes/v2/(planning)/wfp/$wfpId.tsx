import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(planning)/wfp/$wfpId')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Wfp.View}
      message="You do not have permission to view this Work and Financial Plan."
    >
      <Outlet />
    </RoutePermissionGuard>
  )
}
