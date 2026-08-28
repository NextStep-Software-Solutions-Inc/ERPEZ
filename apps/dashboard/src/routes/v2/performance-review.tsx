import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import PerformanceReviewPageV2 from '@/pages/planning/performance-review/PerformanceReviewPageV2'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

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
  return (
    <RoutePermissionGuard
      permission={[
        PERMISSIONS.Planning.Opcr.View,
        PERMISSIONS.Planning.Opcr.Evaluate,
      ]}
      message="You do not have permission to view Performance Review."
    >
      <PerformanceReviewPageV2 />
    </RoutePermissionGuard>
  )
}
