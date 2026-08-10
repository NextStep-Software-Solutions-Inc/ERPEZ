import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrdersDirectAcquisitionPage } from '@/features/procurement/purchase-orders/pages'

export const Route = createFileRoute('/v2/(procurement)/po-direct-acquisition/')({
  component: PoDirectAcquisitionRoute,
})

function PoDirectAcquisitionRoute() {
  return <PurchaseOrdersDirectAcquisitionPage />
}
