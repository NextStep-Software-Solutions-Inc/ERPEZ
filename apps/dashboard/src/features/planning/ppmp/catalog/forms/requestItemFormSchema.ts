/**
 * Request Item Form Schema
 * Zod validation for creating and editing item requests
 */

import { z } from 'zod'

export const RequestItemFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Item name must be at least 3 characters')
    .max(100, 'Item name must not exceed 100 characters'),

  procurementCategory: z.enum(['Goods', 'Infra', 'Consulting'] as const),

  itemCategory: z
    .string()
    .min(1, 'Please select an item category')
    .max(50, 'Item category must not exceed 50 characters'),

  unitOfMeasure: z
    .string()
    .min(1, 'Please specify unit of measurement')
    .max(20, 'Unit of measurement must not exceed 20 characters'),

  estimatedUnitCost: z
    .number()
    .positive('Estimated unit cost must be greater than 0')
    .min(1, 'Estimated unit cost is required'),

  specifications: z
    .string()
    .min(20, 'Specifications must be at least 20 characters')
    .max(1000, 'Specifications must not exceed 1000 characters'),

  imageFile: z
    .instanceof(File)
    .refine((file) => file.size < 5 * 1024 * 1024, {
      message: 'Image must be less than 5MB',
    })
    .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), {
      message: 'Image must be JPEG or PNG',
    })
    .optional(),
})

export type RequestItemFormValues = z.infer<typeof RequestItemFormSchema>

/**
 * Form for editing requests (optional itemCategory validation)
 * Used when cascading might not load immediately
 */
export const RequestItemEditFormSchema = RequestItemFormSchema.extend({
  id: z.string().min(1, 'Request ID is required'),
})

export type RequestItemEditFormValues = z.infer<
  typeof RequestItemEditFormSchema
>
