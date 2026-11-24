import { createFileRoute } from '@tanstack/react-router'
import ManageSupplierDirectContractingPage from '@/features/procurement/direct-contracting/pages/ManageSupplierDirectContractingPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-supplier-direct-contracting/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Supplier.Manage}
      message="You do not have permission to manage Supplier Direct Contracting."
    >
      <ManageSupplierDirectContractingPage />
    </RoutePermissionGuard>
  )
}
