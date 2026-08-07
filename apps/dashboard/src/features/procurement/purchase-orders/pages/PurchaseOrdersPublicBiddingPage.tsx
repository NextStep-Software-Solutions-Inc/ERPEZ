import { PurchaseOrderWorkspace } from '../components/PurchaseOrderWorkspace'

export function PurchaseOrdersPublicBiddingPage() {
  return (
    <PurchaseOrderWorkspace
      mode="public-bidding"
      role="procurement-staff"
      title="PO: PUBLIC BIDDING"
      description="Draft and manage purchase orders sourced from approved NOAs."
      defaultFilter="draft"
    />
  )
}
