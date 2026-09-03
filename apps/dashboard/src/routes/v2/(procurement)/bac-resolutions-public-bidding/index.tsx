import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  selectedResolutionId: z.string().optional(),
  id: z.string().optional(),
  role: z.enum(['procurement-staff', 'bac-chairperson']).optional(),
})

export const Route = createFileRoute(
  '/v2/(procurement)/bac-resolutions-public-bidding/',
)({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    throw redirect({
      to: '/v2/bac-resolutions',
      search: {
        id: search.id || search.selectedResolutionId,
      },
      replace: true,
    })
  },
  component: () => null,
})

