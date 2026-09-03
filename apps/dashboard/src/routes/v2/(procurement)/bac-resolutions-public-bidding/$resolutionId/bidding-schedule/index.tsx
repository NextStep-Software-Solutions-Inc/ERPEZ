import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  highlightMilestoneKey: z.string().optional(),
})

export const Route = createFileRoute(
  '/v2/(procurement)/bac-resolutions-public-bidding/$resolutionId/bidding-schedule/',
)({
  validateSearch: searchSchema,
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: '/v2/bac-resolutions/$resolutionId/bidding-schedule',
      params: { resolutionId: params.resolutionId },
      search: { highlightMilestoneKey: search.highlightMilestoneKey },
      replace: true,
    })
  },
  component: () => null,
})

