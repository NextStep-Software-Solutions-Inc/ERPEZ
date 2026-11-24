import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import PurchaseRequestPageV2 from '@/features/procurement/purchase-requests-pr/pages/PurchaseRequestPageV2'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const purchaseRequestsPrSearchSchema = z.object({
  tab: z.enum(['non-cse', 'out-of-stock', 'manage-pr']).catch('non-cse'),
  aprId: z.string().optional(),
  officeId: z.string().optional(),
})

export const Route = createFileRoute('/v2/(procurement)/purchase-requests-pr/')({
  component: PurchaseRequestsPrRoute,
  validateSearch: (search: Record<string, unknown>) => {
    const parsedSearch = purchaseRequestsPrSearchSchema.safeParse(search)

    return parsedSearch.success
      ? parsedSearch.data
      : {
          tab: 'non-cse',
        }
  },
})

function PurchaseRequestsPrRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Pr.Create}
      message="You do not have permission to view Purchase Requests."
    >
      <PurchaseRequestPageV2 />
    </RoutePermissionGuard>
  )
}
