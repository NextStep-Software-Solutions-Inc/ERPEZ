import { createFileRoute } from '@tanstack/react-router'
import { DirectContractingItemPage } from '@/features/procurement/supplier-portal/pages/DirectContractingItemPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/supplier-portal/direct-contracting-item/')({
  component: SupplierPortalDCItemRoute,
})

function SupplierPortalDCItemRoute() {
  return (
    <RoutePermissionGuard
      permission={[
        PERMISSIONS.Procurement.Supplier.View,
        PERMISSIONS.Procurement.Po.Manage,
      ]}
      message="You do not have permission to view Direct Contracting items."
    >
      <DirectContractingItemPage />
    </RoutePermissionGuard>
  )
}
