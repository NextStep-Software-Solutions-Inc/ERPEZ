import { PurchaseOrderWorkspace } from '../components/PurchaseOrderWorkspace'

export function PurchaseOrdersUnifiedPage() {
  return (
    <PurchaseOrderWorkspace
      mode="all"
      role="procurement-staff"
      title="Purchase Orders"
      description="Unified management workspace for Purchase Orders across SVP, Public Bidding, and Direct Acquisition."
      defaultFilter="all"
    />
  )
}
