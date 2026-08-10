/**
 * Performance Measuring Scale Form Zod Schema
 * Validation for create/edit forms
 */

import * as z from 'zod'
import { IndicatorDimension } from '../types'

/**
 * Custom rating level schema
 */
const customRatingLevelSchema = z
  .object({
    rating: z
      .enum(['5', '4', '3', '2', '1'])
      .transform((v) => parseInt(v) as 5 | 4 | 3 | 2 | 1),
    description: z
      .string()
      .min(1, 'Description is required')
      .min(3, 'Description must be at least 3 characters'),
    minRange: z.coerce.number().optional(),
    maxRange: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.minRange !== undefined && data.maxRange !== undefined) {
        return data.minRange < data.maxRange
      }
      return true
    },
    {
      message: 'Minimum range must be less than maximum range',
      path: ['minRange'],
    },
  )

export const baseFormSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(3, 'Name must be at least 3 characters'),
    statement: z
      .string()
      .min(1, 'Statement is required')
      .min(5, 'Statement must be at least 5 characters'),
    dimensions: z
      .array(z.nativeEnum(IndicatorDimension))
      .min(1, 'At least one dimension must be selected'),
    templateId: z.string().min(1, 'Rating scale template is required'),
    mov: z
      .array(z.string().min(1, 'MOV entry is required'))
      .min(1, 'At least one Means of Verification is required'),
    useCustomRating: z.boolean().default(false),
    customRating: z
      .object({
        rating5: customRatingLevelSchema,
        rating4: customRatingLevelSchema,
        rating3: customRatingLevelSchema,
        rating2: customRatingLevelSchema,
        rating1: customRatingLevelSchema,
      })
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // If useCustomRating and customRating should be provided
      if (data.useCustomRating && !data.customRating) {
        return false
      }
      return true
    },
    {
      message:
        'Custom rating levels are required when custom rating is enabled',
      path: ['customRating'],
    },
  )

export const performanceMeasuringScaleFormSchema = baseFormSchema

export type PerformanceMeasuringScaleFormValues = z.infer<typeof baseFormSchema>
