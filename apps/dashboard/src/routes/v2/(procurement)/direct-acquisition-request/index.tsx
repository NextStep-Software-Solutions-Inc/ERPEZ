import { createFileRoute } from '@tanstack/react-router'
import { DirectAcquisitionRequestPage } from '@/features/procurement/direct-acquisition/pages/DirectAcquisitionRequestPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/direct-acquisition-request/')({
  component: DirectAcquisitionRequestRoute,
})

function DirectAcquisitionRequestRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Pr.Create}
      message="You do not have permission to view Direct Acquisition Requests."
    >
      <DirectAcquisitionRequestPage />
    </RoutePermissionGuard>
  )
}


