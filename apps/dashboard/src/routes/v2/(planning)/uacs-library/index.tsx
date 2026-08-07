import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import UACSPage from '@/pages/planning/uacs/UACSPage'
import UACSLayout from '@/pages/planning/uacs/UACSLayout'

/**
 * Search schema for UACS Library
 * Defines the query parameters for tabs, pagination, and filtering
 */
const searchSchema = z.object({
  // Pagination
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
  
  // Main tab selection
  tab: z
    .enum(['code-segments', 'rules', 'data-management'])
    .optional()
    .default('code-segments'),
  
  // Sub-tab for code segments
  codeSegmentTab: z
    .enum(['funding-source', 'organization', 'location', 'mfo-pap', 'object'])
    .optional()
    .default('funding-source'),
  
  // Sub-tab for rules
  ruleTab: z
    .enum(['expense-mapping', 'fiscal-validity', 'combination'])
    .optional()
    .default('expense-mapping'),
  
  // Sub-tab for data management
  dataTab: z
    .enum(['import', 'export', 'sync'])
    .optional()
    .default('import'),
  
  // Search and filtering
  search: z.string().optional(),
  fiscalYear: z.number().optional(),
  isActive: z.boolean().optional(),
  expenseClass: z.enum(['PS', 'MOOE', 'CO', 'FE']).optional(),
  
  // Sorting
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  
  // Dialog states
  create: z.boolean().optional(),
  edit: z.boolean().optional(),
  delete: z.boolean().optional(),
  view: z.boolean().optional(),
})

export const Route = createFileRoute('/v2/(planning)/uacs-library/')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  return (
    <UACSLayout>
      <UACSPage />
    </UACSLayout>
  )
}
