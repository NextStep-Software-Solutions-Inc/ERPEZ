import { createFileRoute } from '@tanstack/react-router'
import { ManagePurchaseOrdersPage } from '@/features/procurement/purchase-orders/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-po/')({
  component: ManagePoRoute,
})

function ManagePoRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to manage Purchase Orders."
    >
      <ManagePurchaseOrdersPage />
    </RoutePermissionGuard>
  )
}
