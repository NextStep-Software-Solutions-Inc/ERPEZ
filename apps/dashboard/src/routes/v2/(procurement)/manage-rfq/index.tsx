import { createFileRoute } from '@tanstack/react-router'
import ManageRFQApprovalPage from '@/features/procurement/rfq/pages/ManageRFQApprovalPage'


export const Route = createFileRoute('/v2/(procurement)/manage-rfq/')({
  component: ManageRfqRoute,
})

function ManageRfqRoute() {
  // Use approval page as the UI for Manage RFQ
  return <ManageRFQApprovalPage />
}
