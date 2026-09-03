import { createFileRoute } from '@tanstack/react-router'
import PurchaseRequestPageV2 from '@/features/procurement/purchase-requests-pr/pages/PurchaseRequestPageV2'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-prs/')({
  component: ManagePrsRoute,
})

function ManagePrsRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Pr.Manage}
      message="You do not have permission to manage Purchase Requests."
    >
      <PurchaseRequestPageV2 />
    </RoutePermissionGuard>
  )
}
