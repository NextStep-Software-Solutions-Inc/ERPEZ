import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrderDetailsPage } from '@/features/procurement/purchase-orders/pages'

export const Route = createFileRoute('/v2/(procurement)/po/$purchaseOrderId/')({
  component: PurchaseOrderDetailsRoute,
})

function PurchaseOrderDetailsRoute() {
  const { purchaseOrderId } = Route.useParams()

  return <PurchaseOrderDetailsPage purchaseOrderId={purchaseOrderId} />
}
