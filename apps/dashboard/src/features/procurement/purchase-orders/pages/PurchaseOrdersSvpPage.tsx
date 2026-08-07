import { PurchaseOrderWorkspace } from '../components/PurchaseOrderWorkspace'

export function PurchaseOrdersSvpPage() {
  return (
    <PurchaseOrderWorkspace
      mode="svp"
      role="procurement-staff"
      title="PO : SVP"
      description="Draft and manage purchase orders sourced from approved AOBs."
      defaultFilter="draft"
    />
  )
}
