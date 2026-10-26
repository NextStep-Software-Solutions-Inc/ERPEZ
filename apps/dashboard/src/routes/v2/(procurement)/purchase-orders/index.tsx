import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PurchaseOrdersUnifiedPage } from '@/features/procurement/purchase-orders/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const purchaseOrdersSearchSchema = z.object({
  mode: z.enum(['all', 'svp', 'public-bidding', 'direct-acquisition']).catch('all').optional(),
})

export const Route = createFileRoute('/v2/(procurement)/purchase-orders/')({
  validateSearch: purchaseOrdersSearchSchema,
  component: PurchaseOrdersUnifiedRoute,
})

function PurchaseOrdersUnifiedRoute() {
  const { mode } = Route.useSearch()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to view Purchase Orders."
    >
      <PurchaseOrdersUnifiedPage initialMode={mode} />
    </RoutePermissionGuard>
  )
}
