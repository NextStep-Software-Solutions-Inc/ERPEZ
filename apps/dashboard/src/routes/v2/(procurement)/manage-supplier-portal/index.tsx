import { createFileRoute } from '@tanstack/react-router'
import ManageSupplierPortalPage from '@/features/procurement/manage-supplier-portal/pages/ManageSupplierPortalPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-supplier-portal/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Supplier.Manage}
      message="You do not have permission to manage the Supplier Portal."
    >
      <ManageSupplierPortalPage />
    </RoutePermissionGuard>
  )
}
