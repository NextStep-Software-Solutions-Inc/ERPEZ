import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import FiscalYearPage from '@/pages/planning/kpi/FiscalYearPage'

const searchSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
  search: z.string().optional(),
  kpiSearch: z.string().optional(),
  fiscalYearSearch: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  tab: z
    .enum(['kpi', 'fiscal-year', 'kpi-assignment-for-du'])
    .optional()
    .default('kpi'),
})

export const Route = createFileRoute('/v1/planning/fiscal-year/')({
  component: FiscalYearPage,
  validateSearch: searchSchema,
})
