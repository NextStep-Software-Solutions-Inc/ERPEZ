/**
 * CostItemFormSchema
 * Shared validation for Cost Master create/edit dialogs.
 */

import { z } from 'zod'

export const costItemFormSchema = z.object({
  costItemName: z
    .string()
    .min(3, 'Cost item name must be at least 3 characters')
    .max(200, 'Cost item name must not exceed 200 characters'),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(100, 'Category must not exceed 100 characters'),
  subcategory: z.string().optional().nullable(),
  standardUnitCost: z
    .number()
    .positive('Standard unit cost must be greater than 0'),
  unitOfMeasure: z
    .string()
    .min(1, 'Unit of measure is required')
    .max(50, 'Unit of measure must not exceed 50 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must not exceed 1000 characters'),
  uacsCode: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export type CostItemFormValues = z.infer<typeof costItemFormSchema>
