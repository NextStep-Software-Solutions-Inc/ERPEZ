import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrdersUnifiedPage } from '@/features/procurement/purchase-orders/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/purchase-orders/')({
  component: PurchaseOrdersUnifiedRoute,
})

function PurchaseOrdersUnifiedRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to view Purchase Orders."
    >
      <PurchaseOrdersUnifiedPage />
    </RoutePermissionGuard>
  )
}
