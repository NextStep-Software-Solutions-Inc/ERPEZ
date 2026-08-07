import * as z from 'zod'

// Base schema for field-level validation (no refine, to avoid ZodEffects constraints in TanStack Form)
export const functionConfigBaseSchema = z.object({
  fiscalYearId: z.string().min(1, 'Please select a valid fiscal year'),
  strategicMinWeight: z
    .number()
    .min(0, 'Min weight ≥ 0')
    .max(100, 'Min weight ≤ 100'),
  strategicMaxWeight: z
    .number()
    .min(0, 'Max weight ≥ 0')
    .max(100, 'Max weight ≤ 100')
    // .optional()
    .nullable(),
  coreFunctionMinWeight: z
    .number()
    .min(0, 'Min weight ≥ 0')
    .max(100, 'Min weight ≤ 100'),
  coreFunctionMaxWeight: z
    .number()
    .min(0, 'Max weight ≥ 0')
    .max(100, 'Max weight ≤ 100')
    // .optional()
    .nullable(),
  supportMinWeight: z
    .number()
    .min(0, 'Min weight ≥ 0')
    .max(100, 'Min weight ≤ 100'),
  supportMaxWeight: z
    .number()
    .min(0, 'Max weight ≥ 0')
    .max(100, 'Max weight ≤ 100')
    // .optional()
    .nullable(),
})

// Full schema with cross-field validation for type-inference and final check
export const functionConfigFormSchema = functionConfigBaseSchema
  .refine(
    (data) => {
      if (data.strategicMaxWeight !== null) {
        return data.strategicMinWeight <= data.strategicMaxWeight
      }
      return true
    },
    {
      message: 'Strategic min weight cannot exceed max',
      path: ['strategicMinWeight'],
    },
  )
  .refine(
    (data) => {
      if (data.coreFunctionMaxWeight !== null) {
        return data.coreFunctionMinWeight <= data.coreFunctionMaxWeight
      }
      return true
    },
    {
      message: 'Core function min weight cannot exceed max',
      path: ['coreFunctionMinWeight'],
    },
  )
  .refine(
    (data) => {
      if (data.supportMaxWeight !== null) {
        return data.supportMinWeight <= data.supportMaxWeight
      }
      return true
    },
    {
      message: 'Support function min weight cannot exceed max',
      path: ['supportMinWeight'],
    },
  )

export type FunctionConfigFormValues = z.infer<typeof functionConfigFormSchema>
