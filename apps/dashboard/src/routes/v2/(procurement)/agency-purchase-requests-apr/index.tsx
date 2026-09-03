import { createFileRoute } from '@tanstack/react-router'
import APRListPage from '@/pages/procurement/apr/APRListPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/agency-purchase-requests-apr/')({
  component: AgencyPurchaseRequestsAprRoute,
})

function AgencyPurchaseRequestsAprRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Pr.Create}
      message="You do not have permission to view Agency Purchase Requests."
    >
      <APRListPage />
    </RoutePermissionGuard>
  )
}
