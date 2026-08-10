import { createFileRoute } from '@tanstack/react-router'
import { RFQPage } from '@/features/procurement/rfq/pages/RFQPage'

export const Route = createFileRoute('/v2/(procurement)/request-for-quotation-rfq/')({
  component: RequestForQuotationRfqRoute,
})

function RequestForQuotationRfqRoute() {
  return <RFQPage />
}
