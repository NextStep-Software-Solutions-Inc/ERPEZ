import { createFileRoute } from '@tanstack/react-router'
import AppFormPage from '@/pages/planning/app/AppFormPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(planning)/annual-performance-planning',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Target.Manage}
      message="You do not have permission to view Annual Performance Planning."
    >
      <AppFormPage />
    </RoutePermissionGuard>
  )
}