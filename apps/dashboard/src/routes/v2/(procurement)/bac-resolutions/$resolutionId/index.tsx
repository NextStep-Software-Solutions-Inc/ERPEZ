import { createFileRoute } from '@tanstack/react-router'
import DetailsPanel from '@/features/procurement/bac-resolution/components/DetailsPanel'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(procurement)/bac-resolutions/$resolutionId/',
)({
  component: BacResolutionDetailRoute,
})

function BacResolutionDetailRoute() {
  const { resolutionId } = Route.useParams()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to view this BAC Resolution."
    >
      <DetailsPanel
        selectedId={resolutionId}
        role="procurement-staff"
      />
    </RoutePermissionGuard>
  )
}
