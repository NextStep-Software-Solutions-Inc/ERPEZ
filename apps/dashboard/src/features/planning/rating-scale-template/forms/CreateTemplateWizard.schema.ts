/**
 * Create Template Wizard Schema
 * Pattern: SPMS Decoupled Form (TanStack Form + Zod)
 * Validates all wizard steps in a unified schema
 */

import * as z from 'zod'
import { ScaleType } from '../types'

/**
 * Base schema for a rating level
 */
const ratingLevelSchema = z.object({
  rating: z.number(),
  description: z.string().min(1, 'Description is required'),
  minRange: z.number().optional(),
  maxRange: z.number().optional(),
})

/**
 * Base schema for template wizard form data
 */
export const createTemplateWizardBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Template name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  scaleType: z.enum([ScaleType.FIXED, ScaleType.NON_FIXED]),
  rating5: ratingLevelSchema,
  rating4: ratingLevelSchema,
  rating3: ratingLevelSchema,
  rating2: ratingLevelSchema,
  rating1: ratingLevelSchema,
})

/**
 * Form values type derived from schema
 */
export type CreateTemplateWizardFormValues = z.infer<
  typeof createTemplateWizardBaseSchema
>

/**
 * Default values for wizard form
 */
export const defaultCreateTemplateWizardValues: CreateTemplateWizardFormValues =
  {
    name: '',
    description: '',
    scaleType: ScaleType.FIXED,
    rating5: { rating: 5, description: '' },
    rating4: { rating: 4, description: '' },
    rating3: { rating: 3, description: '' },
    rating2: { rating: 2, description: '' },
    rating1: { rating: 1, description: '' },
  }
