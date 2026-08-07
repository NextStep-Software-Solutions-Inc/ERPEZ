import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { BiddingMasterCalendarPage } from '@/features/procurement/bidding-master-calendar'

const searchSchema = z.object({
  selectedResolutionId: z.string().optional(),
  selectedEventId: z.string().optional(),
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
    <BiddingMasterCalendarPage
      selectedResolutionId={search.selectedResolutionId}
      selectedEventId={search.selectedEventId}
      drawerTab={search.drawerTab}
    />
  )
}
