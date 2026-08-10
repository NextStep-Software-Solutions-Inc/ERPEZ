/**
 * CostItemMasterPage
 * Admin-facing cost master library section within Item Management.
 */

import { CostItemMasterTable } from '../tables/CostItemMasterTable'
import { CreateCostItemDialog } from '../dialogs/CreateCostItemDialog'
import { EditCostItemDialog } from '../dialogs/EditCostItemDialog'

export function CostItemMasterPage() {
  return (
    <div className="space-y-6">
      <CostItemMasterTable />
      <CreateCostItemDialog />
      <EditCostItemDialog />
    </div>
  )
}
