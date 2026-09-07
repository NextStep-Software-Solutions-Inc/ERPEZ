import { createFileRoute } from '@tanstack/react-router'
import { ResolutionClausesPage } from '@/features/procurement/resolution-clauses'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(procurement)/bac-resolutions/clauses/',
)({
  component: BacResolutionClausesRoute,
})

function BacResolutionClausesRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.ProcurementLibrary.Manage}
      message="You do not have permission to manage Resolution Clauses."
    >
      <ResolutionClausesPage />
    </RoutePermissionGuard>
  )
}
