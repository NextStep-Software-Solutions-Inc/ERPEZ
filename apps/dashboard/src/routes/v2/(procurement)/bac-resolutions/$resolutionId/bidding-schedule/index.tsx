import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { BiddingSchedulePage } from '@/features/procurement/bidding-schedule/pages'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const searchSchema = z.object({
  highlightMilestoneKey: z.string().optional(),
})

export const Route = createFileRoute(
  '/v2/(procurement)/bac-resolutions/$resolutionId/bidding-schedule/',
)({
  validateSearch: searchSchema,
  component: BiddingScheduleRoute,
})

function BiddingScheduleRoute() {
  const { resolutionId } = Route.useParams()
  const search = Route.useSearch()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to view Bidding Schedules."
    >
      <BiddingSchedulePage
        bacResolutionId={resolutionId}
        highlightMilestoneKey={search.highlightMilestoneKey}
      />
    </RoutePermissionGuard>
  )
}
