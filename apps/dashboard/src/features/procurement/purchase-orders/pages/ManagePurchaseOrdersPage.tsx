import { PurchaseOrderWorkspace } from '../components/PurchaseOrderWorkspace'

export function ManagePurchaseOrdersPage() {
  return (
    <PurchaseOrderWorkspace
      mode="manage"
      role="hope"
      title="Manage PO"
      description="Unified approval queue for purchase orders waiting for HOPE or authorized review."
      defaultFilter="for-approval"
    />
  )
}
