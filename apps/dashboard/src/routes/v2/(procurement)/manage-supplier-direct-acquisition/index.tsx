import { createFileRoute } from '@tanstack/react-router'
import ManageSupplierDirectAcquisitionPage from '@/features/procurement/direct-acquisition/pages/ManageSupplierDirectAcquisitionPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-supplier-direct-acquisition/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Supplier.Manage}
      message="You do not have permission to manage Supplier Direct Acquisitions."
    >
      <ManageSupplierDirectAcquisitionPage />
    </RoutePermissionGuard>
  )
}
