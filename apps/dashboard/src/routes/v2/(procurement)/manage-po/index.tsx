import { createFileRoute } from '@tanstack/react-router'
import { ManagePurchaseOrdersPage } from '@/features/procurement/purchase-orders/pages'

export const Route = createFileRoute('/v2/(procurement)/manage-po/')({
  component: ManagePoRoute,
})

function ManagePoRoute() {
  return <ManagePurchaseOrdersPage />
}
