/**
 * Rating Scale Zod Schema
 * Pattern: SPMS Validated Form Scheme
 */

import * as z from 'zod'

/**
 * Base schema for General Rating Scale
 * Handles field-level validation including ranges and naming
 */
export const ratingScaleBaseSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Rating name is required')
      .max(100, 'Name must be 100 characters or less'),
    minWeight: z
      .number()
      .min(0, 'Minimum weight cannot be less than 0')
      .max(5, 'Weight cannot exceed 5.00')
      .default(0),
    maxWeight: z
      .number()
      .min(0, 'Maximum weight cannot be less than 0')
      .max(5, 'Weight cannot exceed 5.00')
      .default(0),
    description: z
      .string()
      .trim()
      .max(500, 'Description must be 500 characters or less')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.maxWeight > data.minWeight, {
    message: 'Maximum weight must be greater than minimum weight',
    path: ['maxWeight'],
  })

/**
 * Form values derived from the schema
 */
export type RatingScaleFormValues = z.infer<typeof ratingScaleBaseSchema>

/**
 * Default values for the Rating Scale Form
 */
export const defaultRatingScaleValues: Partial<RatingScaleFormValues> = {
  name: '',
  minWeight: 0,
  maxWeight: 0,
  description: '',
}

/**
 * Creates a schema with uniqueness refinement
 * Validates that the rating scale name is unique within the fiscal year
 * Excludes the current item when in edit mode (for comparison)
 *
 * @param existingRatingScales - Array of existing rating scales in the fiscal year
 * @param currentScaleId - Optional ID of the scale being edited (for exclusion)
 * @returns Zod schema with refinement function
 */
export const createRatingScaleSchemaWithRefinement = (
  existingRatingScales: Array<{ id: string; adjectivalRatingName: string }>,
  currentScaleId?: string,
) => {
  return ratingScaleBaseSchema.superRefine((data, ctx) => {
    // Check for duplicate names (case-insensitive)
    const isDuplicate = existingRatingScales.some(
      (scale) =>
        scale.adjectivalRatingName.toLowerCase() === data.name.toLowerCase() &&
        scale.id !== currentScaleId, // Exclude current scale in edit mode
    )

    if (isDuplicate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `A rating scale with the name "${data.name}" already exists in this fiscal year.`,
        path: ['name'],
      })
    }
  })
}
