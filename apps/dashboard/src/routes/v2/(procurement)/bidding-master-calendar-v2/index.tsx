import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { BiddingMasterCalendarPageV2 } from '@/features/procurement/bidding-master-calendar-v2'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const searchSchema = z.object({
  selectedResolutionId: z.string().optional(),
})

export const Route = createFileRoute(
  '/v2/(procurement)/bidding-master-calendar-v2/',
)({
  validateSearch: searchSchema,
  component: BiddingMasterCalendarV2Route,
})

export function BiddingMasterCalendarV2Route() {
  const search = Route.useSearch()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to view the Bidding Master Calendar."
    >
      <BiddingMasterCalendarPageV2
        selectedResolutionId={search.selectedResolutionId}
      />
    </RoutePermissionGuard>
  )
}
