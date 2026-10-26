import APRDetailsPage from '@/pages/procurement/apr/APRDetailsPage'
import { createFileRoute } from '@tanstack/react-router'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-aprs/$aprId')({
  component: ManageAPRDetailsRoute,
})

function ManageAPRDetailsRoute() {
  const { aprId } = Route.useParams()
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Pr.Manage}
      message="You do not have permission to review or manage APR details."
    >
      <APRDetailsPage aprId={aprId} isReviewerMode={true} />
    </RoutePermissionGuard>
  )
}
