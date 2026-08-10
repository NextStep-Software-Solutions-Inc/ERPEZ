import * as z from 'zod'

// Base schema for field-level validation (no refine, to avoid ZodEffects constraints in TanStack Form)
export const economicIndicatorBaseSchema = z.object({
  fiscalYearId: z.string().min(1, 'Please select a valid fiscal year'),
  vatRate: z
    .number()
    .min(0, 'VAT Rate must be ≥ 0%')
    .max(100, 'VAT Rate must be ≤ 100%'),
  inflationRate: z
    .number()
    .min(0, 'Inflation Rate must be ≥ 0%')
    .max(100, 'Inflation Rate must be ≤ 100%'),
  incomeTaxRate: z
    .number()
    .min(0, 'Income Tax Rate must be ≥ 0%')
    .max(100, 'Income Tax Rate must be ≤ 100%'),
})

// Full schema for type inference and final validation (no additional cross-field checks needed)
export const economicIndicatorFormSchema = economicIndicatorBaseSchema

export type EconomicIndicatorFormValues = z.infer<
  typeof economicIndicatorFormSchema
>
