/**
 * Performance Measuring Scale Types (UI/Legacy)
 * These types are primarily used for the Scale Builder UI and local form states.
 */

import { IndicatorDimension } from './indicator-dimension.types'

/**
 * Custom rating level for performance measuring scales
 */
export interface CustomRatingLevel {
  rating: 5 | 4 | 3 | 2 | 1
  description: string
  minRange?: number
  maxRange?: number
}

/**
 * Performance Measuring Scale Entity (UI/Mock representation)
 */
export interface PerformanceMeasuringScale {
  id: string
  name: string
  masterKPIId: string
  statement: string
  dimensions: IndicatorDimension[]
  mov: string[]
  templateId: string
  customRating?: {
    rating5: CustomRatingLevel
    rating4: CustomRatingLevel
    rating3: CustomRatingLevel
    rating2: CustomRatingLevel
    rating1: CustomRatingLevel
  } | null
  createdAt: string
  updatedAt: string
}

/**
 * Form data for a single performance measuring scale row
 */
export interface PerformanceMeasuringScaleRowFormValues {
  name: string
  statement: string
  dimensions: IndicatorDimension[]
  mov: string[]
  templateId: string
  useCustomRating: boolean
  customRating?: {
    rating5: CustomRatingLevel
    rating4: CustomRatingLevel
    rating3: CustomRatingLevel
    rating2: CustomRatingLevel
    rating1: CustomRatingLevel
  } | null
  isMOVEditable: boolean
  isScaleEditable: boolean
}

/**
 * Form data for building performance measuring scales for a Master KPI
 */
export interface PerformanceMeasuringScaleBuilderFormValues {
  masterKPIId: string
  scales: PerformanceMeasuringScaleRowFormValues[]
}
