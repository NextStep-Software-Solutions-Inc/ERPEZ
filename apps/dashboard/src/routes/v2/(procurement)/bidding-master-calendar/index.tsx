import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { BiddingMasterCalendarPageV2 } from '@/features/procurement/bidding-master-calendar-v2'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const searchSchema = z.object({
  selectedResolutionId: z.string().optional(),
  resolutionId: z.string().optional(),
  selectedEventId: z.string().optional(),
  openDrawer: z.boolean().optional(),
  drawerTab: z
    .enum([
      'project-detail',
      'milestones',
      'conflicts',
      'notifications',
      'audit-log',
      'linked-actions',
      'all-projects',
    ])
    .optional(),
})

export const Route = createFileRoute(
  '/v2/(procurement)/bidding-master-calendar/',
)({
  validateSearch: searchSchema,
  component: BiddingMasterCalendarRoute,
})

export function BiddingMasterCalendarRoute() {
  const search = Route.useSearch()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to view the Bidding Master Calendar."
    >
      <BiddingMasterCalendarPageV2
        selectedResolutionId={search.selectedResolutionId}
        resolutionId={search.resolutionId}
        selectedEventId={search.selectedEventId}
        openDrawer={search.openDrawer}
        drawerTab={search.drawerTab}
      />
    </RoutePermissionGuard>
  )
}
