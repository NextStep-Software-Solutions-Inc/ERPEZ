import { z } from 'zod'

/**
 * Zod Schema for CreateAPPForm Validation
 * 
 * Validates:
 * - APP Name: non-empty, trimmed, max 200 chars
 * - APP Code: format APP-YYYY-XXX, uppercase
 * - Fiscal Year: valid year
 * - Type: Indicative or Supplemental
 */
export const createAppSchema = z.object({
  appName: z
    .string()
    .min(1, 'APP Name is required')
    .max(200, 'APP Name must be less than 200 characters')
    .trim(),
  appCode: z
    .string()
    .min(1, 'APP Code is required')
    .regex(/^APP-\d{4}-\d{3}$/i, 'APP Code must be in format APP-YYYY-XXX')
    .transform((val) => val.toUpperCase()),
  fiscalYear: z
    .number()
    .int('Fiscal Year must be an integer')
    .min(2000, 'Fiscal Year must be 2000 or later')
    .max(2099, 'Fiscal Year must be 2099 or earlier'),
  type: z.enum(['Indicative', 'Supplemental'], {
    errorMap: () => ({ message: 'APP Type must be either Indicative or Supplemental' }),
  }),
})

export type CreateAppFormValues = z.infer<typeof createAppSchema>
