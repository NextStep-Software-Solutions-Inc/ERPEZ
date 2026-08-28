import { createFileRoute } from '@tanstack/react-router'
import { ManageWhereasClausesPage } from '@/features/procurement/bac-resolution/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(procurement)/bac-resolutions/clauses/',
)({
  component: ManageWhereasClausesRoute,
})

function ManageWhereasClausesRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to manage Whereas clauses."
    >
      <ManageWhereasClausesPage />
    </RoutePermissionGuard>
  )
}
