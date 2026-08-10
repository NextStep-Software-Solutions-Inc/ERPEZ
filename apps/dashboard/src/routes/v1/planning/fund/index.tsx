import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import FundPage from '@/pages/planning/fund/FundPage'
import FundLayout from '@/pages/planning/fund/FundLayout'

const searchSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
  search: z.string().optional(),
  fundSourceSearch: z.string().optional(),
  fundReceivingSearch: z.string().optional(),
  budgetAllocationSearch: z.string().optional(),
  fundMonitoringSearch: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  tab: z
    .enum([
      'fund-source',
      'fund-receiving',
      'budget-allocation',
      'fund-monitoring',
    ])
    .optional()
    .default('fund-source'),
  create: z.boolean().optional(),
  delete: z.boolean().optional(),
  update: z.boolean().optional(),
  edit: z.boolean().optional(),
})

export const Route = createFileRoute('/v1/planning/fund/')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  return (
    <FundLayout>
      <FundPage />
    </FundLayout>
  )
}
