import { createFileRoute } from '@tanstack/react-router'
import { RFQItemPage } from '@/features/procurement/supplier-portal/pages/RFQItemPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/supplier-portal/rfq-item/')({
  component: SupplierPortalRFQItemRoute,
})

function SupplierPortalRFQItemRoute() {
  return (
    <RoutePermissionGuard
      permission={[
        PERMISSIONS.Procurement.Supplier.View,
        PERMISSIONS.Procurement.Rfq.Manage,
      ]}
      message="You do not have permission to view RFQ items."
    >
      <RFQItemPage />
    </RoutePermissionGuard>
  )
}
