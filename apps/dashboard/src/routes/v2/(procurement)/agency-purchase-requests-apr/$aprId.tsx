import APRDetailsPage from '@/pages/procurement/apr/APRDetailsPage'
import { createFileRoute } from '@tanstack/react-router'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(procurement)/agency-purchase-requests-apr/$aprId'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { aprId } = Route.useParams()
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Pr.Create}
      message="You do not have permission to view this Agency Purchase Request."
    >
      <APRDetailsPage aprId={aprId} />
    </RoutePermissionGuard>
  )
}
