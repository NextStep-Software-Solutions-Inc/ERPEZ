import { createFileRoute } from '@tanstack/react-router'
import { RFQItemPage } from '@/features/procurement/supplier-portal/pages/RFQItemPage'

export const Route = createFileRoute('/v2/(procurement)/supplier-portal/rfq-item/')({
  component: SupplierPortalRFQItemRoute,
})

function SupplierPortalRFQItemRoute() {
  return <RFQItemPage />
}
