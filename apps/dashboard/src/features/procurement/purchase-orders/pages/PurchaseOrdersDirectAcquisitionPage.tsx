import { PurchaseOrderWorkspace } from '../components/PurchaseOrderWorkspace'

export function PurchaseOrdersDirectAcquisitionPage() {
  return (
    <PurchaseOrderWorkspace
      mode="direct-acquisition"
      role="procurement-staff"
      title="PO: DIRECT ACQUISITION"
      description="Draft and manage purchase orders sourced from approved Direct Acquisitions."
      defaultFilter="all"
    />
  )
}
