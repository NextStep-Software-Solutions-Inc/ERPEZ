import { createFileRoute } from '@tanstack/react-router'
import APRListPage from '@/pages/procurement/apr/APRListPage'

export const Route = createFileRoute('/v2/(procurement)/agency-purchase-requests-apr/')({
  component: AgencyPurchaseRequestsAprRoute,
})

function AgencyPurchaseRequestsAprRoute() {
  return <APRListPage />
}
