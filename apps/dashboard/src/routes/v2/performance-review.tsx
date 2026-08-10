import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import PerformanceReviewPageV2 from '@/pages/planning/performance-review/PerformanceReviewPageV2'

const searchSchema = z.object({
  tab: z
    .enum([
      'SelfRating',
      'PMTWorkspace',
      'OutputWorkflow',
      'LogicEngine',
      'AgencyRanking',
    ])
    .optional()
    .default('SelfRating'),
  opcrId: z.string().optional(),
  officeId: z.string().optional(),
})

export const Route = createFileRoute('/v2/performance-review')({
  component: RouteComponent,
  validateSearch: searchSchema,
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },
})

function RouteComponent() {
  return <PerformanceReviewPageV2 />
}
