import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrdersPublicBiddingPage } from '@/features/procurement/purchase-orders/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/po-public-bidding/')({
  component: PoPublicBiddingRoute,
})

function PoPublicBiddingRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to view Purchase Orders (Public Bidding)."
    >
      <PurchaseOrdersPublicBiddingPage />
    </RoutePermissionGuard>
  )
}