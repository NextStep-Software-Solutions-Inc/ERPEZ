/**
 * General Rating Scale Feature Types
 * Feature-specific types extending GeneralRatingScale from lib
 */

import type { GeneralRatingScale } from '@/lib/fiscal-year-and-policies/types'

/**
 * General Rating Scale Form Values (aligned with schema)
 * Used for form submissions and validation
 */
export type GeneralRatingScaleFormValues = {
  name: string // Maps to ratingLabel in API
  minWeight: number // Maps to minScore in API
  maxWeight: number // Maps to maxScore in API
  description?: string
}

/**
 * General Rating Scale with Metadata
 * Extended type including usage tracking
 */
export type GeneralRatingScaleWithMetadata = GeneralRatingScale & {
  usageCount: number // How many success indicators use this scale
  usedBy?: string[] // List of success indicator IDs using this scale
  isInUse: boolean // Computed: usageCount > 0
}

/**
 * Dialog Mode Type
 * Determines whether form is in create or edit mode
 */
export type RatingScaleDialogMode = 'create' | 'edit'

/**
 * API Payload Type for Form Submission
 * Maps form values to API payload structure
 */
export type RatingScaleApiPayload = {
  fiscalYearId: string
  ratingLabel: string // From form.name
  minScore: number // From form.minWeight
  maxScore: number // From form.maxWeight
  description?: string
}

/**
 * Type guard for checking if scale is in use
 */
export function isRatingScaleInUse(
  scale: GeneralRatingScaleWithMetadata,
): boolean {
  return scale.usageCount > 0
}

/**
 * Type guard for checking if scale is deletable
 */
export function canDeleteRatingScale(
  scale: GeneralRatingScaleWithMetadata,
): boolean {
  return !isRatingScaleInUse(scale)
}
