import { createFileRoute } from '@tanstack/react-router'
import PurchaseRequestPageV2 from '@/features/procurement/purchase-requests-pr/pages/PurchaseRequestPageV2'

export const Route = createFileRoute('/v2/(procurement)/manage-prs/')({
  component: ManagePrsRoute,
})

function ManagePrsRoute() {
  return <PurchaseRequestPageV2 />
}
