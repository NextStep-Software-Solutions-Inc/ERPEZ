import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrdersPublicBiddingPage } from '@/features/procurement/purchase-orders/pages'

export const Route = createFileRoute('/v2/(procurement)/po-public-bidding/')({
  component: PoPublicBiddingRoute,
})

function PoPublicBiddingRoute() {
  return <PurchaseOrdersPublicBiddingPage />
}