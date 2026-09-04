import { createFileRoute } from '@tanstack/react-router'
import ManageRFQApprovalPage from '@/features/procurement/rfq/pages/ManageRFQApprovalPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-rfq/')({
  component: ManageRfqRoute,
})

function ManageRfqRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Rfq.Manage}
      message="You do not have permission to manage RFQs."
    >
      <ManageRFQApprovalPage />
    </RoutePermissionGuard>
  )
}
