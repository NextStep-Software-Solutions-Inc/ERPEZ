import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrdersDirectAcquisitionPage } from '@/features/procurement/purchase-orders/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/po-direct-acquisition/')({
  component: PoDirectAcquisitionRoute,
})

function PoDirectAcquisitionRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to view Purchase Orders (Direct Acquisition)."
    >
      <PurchaseOrdersDirectAcquisitionPage />
    </RoutePermissionGuard>
  )
}
