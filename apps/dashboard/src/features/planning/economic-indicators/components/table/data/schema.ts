import { z } from 'zod'

/**
 * Economic Indicator validation schema
 * Validates the structure of EconomicIndicator data for table operations
 */
export const economicIndicatorSchema = z.object({
  id: z.string(),
  fiscalYearId: z.string(),
  fiscalYearYear: z.number(),
  vatRate: z.number(),
  inflationRate: z.number(),
  incomeTaxRate: z.number(),
  createdAt: z.string(),
  createdBy: z.string().nullable(),
  updatedAt: z.string().nullable(),
  updatedBy: z.string().nullable(),
})

export type EconomicIndicatorSchema = z.infer<typeof economicIndicatorSchema>
