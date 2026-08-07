import CommitmentsPage from '@/pages/planning/commitments/CommitmentsPage'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { FunctionCategory } from '@/features/planning/master-kpi/types'

export const commitmentSearchSchema = z.object({
  tab: z
    .enum(['strategicTarget', 'opcr', 'consolidate', 'approvalWorkflow'])
    .default('strategicTarget'),
  fiscalYearId: z.string().optional(),
  strategicTargetTabView: z
    .enum(['kpiAssigned', 'KeyPerformanceIndicator', 'kpiAssignment'])
    .optional(),
  opcrId: z.string().optional(),
  opcrActivityId: z.string().optional(),
  kpiAssignmentId: z.string().optional(),
  kpiViewSource: z
    .enum(['kpiassignment', 'strategicTarget', 'opcr'])
    .optional(),
  kpiId: z.string().optional(),
  isSelectionMode: z.boolean().optional(),
  pageNumber: z.coerce.number().min(1).catch(1).optional(),
  pageSize: z.coerce.number().min(1).catch(25).optional(),
  officeId: z.string().optional(),
  searchQuery: z.string().optional(),
  commitmentStatus: z.string().optional(),
  reviewStatus: z.string().optional(),
  selectedStatuses: z.string().optional(), // Kept for backwards compatibility if needed
  functionCategory: z.enum(FunctionCategory).optional(),
  consolidateSubTab: z
    .enum(['selection', 'consolidated'])
    .default('selection')
    .optional(),
  opcrConsolidationId: z.string().optional(),
  functionTypeId: z.string().optional(),
  selectedActivity: z.string().optional(),
  selectedKpi: z.string().optional(),
})

export const Route = createFileRoute('/v2/commitments/')({
  component: RouteComponent,
  validateSearch: commitmentSearchSchema,
})

function RouteComponent() {
  return <CommitmentsPage />
}
