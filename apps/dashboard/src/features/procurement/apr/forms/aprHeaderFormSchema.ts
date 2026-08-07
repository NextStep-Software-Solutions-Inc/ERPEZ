/**
 * APR Header Metadata Form Schema & Types
 * Captures basic APR information: Date, Agency Ctrl No., Account Code, Description
 */

import { z } from 'zod'

/**
 * APR Header Form Schema (Zod)
 * Validates user input for APR creation header
 */
export const aprHeaderFormSchema = z.object({
  agencyControlNumber: z
    .string()
    .min(1, 'Agency Control Number is required')
    .max(50, 'Agency Control Number must not exceed 50 characters'),
  agencyAccountCode: z
    .string()
    .min(1, 'Agency Account Code is required')
    .max(50, 'Agency Account Code must not exceed 50 characters'),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description must not exceed 500 characters'),
  requestDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Please select a valid date',
  }),
  fiscalYear: z
    .number()
    .min(2000, 'Fiscal year must be valid')
    .max(2100, 'Fiscal year must be valid'),
})

export type APRHeaderFormSchema = z.infer<typeof aprHeaderFormSchema>
