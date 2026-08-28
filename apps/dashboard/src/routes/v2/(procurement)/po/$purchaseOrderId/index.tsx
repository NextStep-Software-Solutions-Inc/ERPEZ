import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrderDetailsPage } from '@/features/procurement/purchase-orders/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/po/$purchaseOrderId/')({
  component: PurchaseOrderDetailsRoute,
})

function PurchaseOrderDetailsRoute() {
  const { purchaseOrderId } = Route.useParams()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to view Purchase Order details."
    >
      <PurchaseOrderDetailsPage purchaseOrderId={purchaseOrderId} />
    </RoutePermissionGuard>
  )
}
