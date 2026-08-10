import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrdersSvpPage } from '@/features/procurement/purchase-orders/pages'

export const Route = createFileRoute('/v2/(procurement)/po-svp/')({
  component: PoSvpRoute,
})

function PoSvpRoute() {
  return <PurchaseOrdersSvpPage />
}