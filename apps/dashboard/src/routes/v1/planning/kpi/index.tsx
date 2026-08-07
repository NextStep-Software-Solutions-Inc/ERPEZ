import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import KPILayout from '@/pages/planning/kpi/KPILayout'
import KpiPage from '@/pages/planning/kpi/KpiPage'

const MAX_KPI_PAGE_SIZE = 999

const searchSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(MAX_KPI_PAGE_SIZE),
  search: z.string().optional(),
  kpiSearch: z.string().optional(),
  fiscalYearSearch: z.string().optional(),
  kpiAssignmentForDuSearch: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  /** Function type filter for KPI (e.g., 'strategicpriority', 'operational') */
  functionTypeFilter: z.string().optional(),
  tab: z
    .enum(['kpi', 'function-allocation', 'kpi-assignment-for-du'])
    .optional()
    .default('kpi'),
  create: z.boolean().optional(),
  delete: z.boolean().optional(),
  edit: z.boolean().optional(),
  lock: z.boolean().optional(),
  unlock: z.boolean().optional(),
})

export const Route = createFileRoute('/v1/planning/kpi/')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  return (
    <KPILayout>
      <KpiPage />
    </KPILayout>
  )
}
