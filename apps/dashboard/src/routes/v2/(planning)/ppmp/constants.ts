import { z } from 'zod'

/**
 * Zod validation schema for /v2/ppmp search parameters
 * Ensures type-safe URL parameter handling and provides defaults
 */
export const ppmpManagementSearchSchema = z.object({
  view: z.enum(['department', 'office']).optional().default('department'),
  pageNumber: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(5).max(100).optional().default(10),
  searchQuery: z.string().optional(),
  status: z.string().optional(),
  fiscalYearId: z.string().optional(),
  officeId: z.string().optional(),
  lib: z.string().optional(),
  consolidated: z.string().optional(),
  sortBy: z.enum(['date', 'budget', 'code']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type PPMPManagementSearch = z.infer<typeof ppmpManagementSearchSchema>
