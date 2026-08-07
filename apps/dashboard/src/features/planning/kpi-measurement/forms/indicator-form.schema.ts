import * as z from 'zod'

/**
 * Base schema for indicator validation
 * Used for field-level feedback during form entry
 */
export const indicatorBaseSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(50, 'Code must be 50 characters or less'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be 1000 characters or less'),
  dimensions: z
    .array(z.string().min(1, 'Dimension cannot be empty'))
    .min(1, 'At least one dimension is required'),
  mov: z
    .array(z.string().min(1, 'Means of Verification cannot be empty'))
    .min(1, 'At least one Means of Verification is required'),
  ratingScaleTemplateIds: z
    .array(z.string())
    .min(1, 'At least one rating scale template is required'),
})

/**
 * Complete form schema with refinements for cross-field validation
 * Used on final submission
 */
export const indicatorFormSchema = indicatorBaseSchema.refine(
  () => {
    // Additional validation can be added here
    // For example: uniqueness checks against existing indicators
    return true
  },
  {
    message: 'Invalid indicator data',
    path: ['code'],
  },
)

export type IndicatorFormValues = z.infer<typeof indicatorFormSchema>
