import { createFileRoute } from '@tanstack/react-router'
import { RFQPage } from '@/features/procurement/rfq/pages/RFQPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/request-for-quotation-rfq/')({
  component: RequestForQuotationRfqRoute,
})

function RequestForQuotationRfqRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Rfq.Manage}
      message="You do not have permission to view Request for Quotation (RFQ)."
    >
      <RFQPage />
    </RoutePermissionGuard>
  )
}
