/**
 * Rating Scale Template Types & Interfaces
 */

/**
 * Scale type classification
 */
export enum ScaleType {
  FIXED = 'Fixed',
  NON_FIXED = 'Non-Fixed',
}

/**
 * Individual rating level definition
 */
export interface RatingLevel {
  rating: 5 | 4 | 3 | 2 | 1
  description: string
  minRange?: number
  maxRange?: number
}

/**
 * Rating Scale Template Entity
 */
export interface RatingScaleTemplate {
  id: string
  name: string
  description?: string
  scaleType: ScaleType
  rating5: RatingLevel
  rating4: RatingLevel
  rating3: RatingLevel
  rating2: RatingLevel
  rating1: RatingLevel
  isDefault?: boolean
  isReadOnly?: boolean
  generalRatingScaleId?: string | null
  author?: string
  usageCount?: number
  createdAt: string
  updatedAt: string
}

/**
 * Form data for creating/editing Rating Scale Template
 */
export interface RatingScaleTemplateFormValues {
  name: string
  description?: string
  scaleType: ScaleType
  rating5: RatingLevel
  rating4: RatingLevel
  rating3: RatingLevel
  rating2: RatingLevel
  rating1: RatingLevel
}

/**
 * API rating scale level request payload
 */
export type RatingScaleLevelRequest = {
  ratingValue: number
  description?: string | null
  minValue?: number | null
  maxValue?: number | null
}

/**
 * API rating scale level response item
 */
export type RatingScaleLevelResponse = {
  id: string
  ratingScaleTemplateId: string
  ratingValue: number
  description: string | null
  minValue: number | null
  maxValue: number | null
}

/**
 * API rating scale template response item
 * Matches ERPEZ.Application.Features.Planning.RatingScaleTemplate.Dtos.RatingScaleTemplateResponse
 */
export type RatingScaleTemplateResponse = {
  id: string
  name: string | null
  description: string | null
  isFixed: boolean
  isDefault: boolean
  generalRatingScaleId: string | null
  createdAt: string
  createdBy: string | null
  RatingScaleLevels?: RatingScaleLevelResponse[] | null
  ratingScaleLevels?: RatingScaleLevelResponse[] | null
  updatedAt?: string | null
  usageCount?: number | null
}

/**
 * API create payload
 */
export type CreateRatingScaleTemplatePayload = {
  name: string
  description?: string | null
  isFixed: boolean
  isDefault: boolean
  generalRatingScaleId?: string | null
  ratingScaleLevels?: RatingScaleLevelRequest[] | null
}

/**
 * API update payload
 */
export type UpdateRatingScaleTemplatePayload = {
  name?: string | null
  description?: string | null
  isFixed?: boolean | null
  isDefault?: boolean | null
  ratingScaleLevels?: RatingScaleLevelRequest[] | null
}

/**
 * Preset defaults for templates
 */
export const DEFAULT_RATING_SCALES: RatingScaleTemplate[] = [
  {
    id: 'efficiency-scale',
    name: 'Efficiency Scale',
    description:
      'Measures operational efficiency based on productivity percentages. Ideal for assessing task completion rates and output quality.',
    scaleType: ScaleType.NON_FIXED,
    rating5: { rating: 5, description: '130% and above', minRange: 130 },
    rating4: {
      rating: 4,
      description: '115% - 129%',
      minRange: 115,
      maxRange: 129,
    },
    rating3: {
      rating: 3,
      description: '100% - 114%',
      minRange: 100,
      maxRange: 114,
    },
    rating2: {
      rating: 2,
      description: '85% - 99%',
      minRange: 85,
      maxRange: 99,
    },
    rating1: { rating: 1, description: 'Below 85%', maxRange: 84 },
    isDefault: true,
    isReadOnly: true,
    author: 'System',
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'accuracy-scale',
    name: 'Accuracy/Quality Scale',
    description:
      'Evaluates data accuracy and work quality through error rate measurement. Essential for quality control and precision-focused roles.',
    scaleType: ScaleType.NON_FIXED,
    rating5: {
      rating: 5,
      description: '0 - 2% error rate',
      minRange: 0,
      maxRange: 2,
    },
    rating4: {
      rating: 4,
      description: '3 - 5% error rate',
      minRange: 3,
      maxRange: 5,
    },
    rating3: {
      rating: 3,
      description: '6 - 10% error rate',
      minRange: 6,
      maxRange: 10,
    },
    rating2: {
      rating: 2,
      description: '11 - 15% error rate',
      minRange: 11,
      maxRange: 15,
    },
    rating1: { rating: 1, description: 'Above 15% error rate', minRange: 16 },
    isDefault: true,
    isReadOnly: true,
    author: 'System',
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'timeliness-scale',
    name: 'Timeliness Scale',
    description:
      'Assesses punctuality and deadline adherence. Use this for project completion, delivery schedules, and time-sensitive deliverables.',
    scaleType: ScaleType.FIXED,
    rating5: { rating: 5, description: 'Delivered early or on schedule' },
    rating4: { rating: 4, description: '1 - 3 days late' },
    rating3: { rating: 3, description: '4 - 7 days late' },
    rating2: { rating: 2, description: '8 - 14 days late' },
    rating1: { rating: 1, description: 'More than 14 days late' },
    isDefault: true,
    isReadOnly: true,
    author: 'System',
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'satisfaction-scale',
    name: 'Satisfaction Scale',
    description:
      'Measures customer or stakeholder satisfaction levels. Perfect for feedback collection, service quality, and user experience assessments.',
    scaleType: ScaleType.FIXED,
    rating5: { rating: 5, description: 'Highly Satisfied' },
    rating4: { rating: 4, description: 'Satisfied' },
    rating3: { rating: 3, description: 'Neutral' },
    rating2: { rating: 2, description: 'Dissatisfied' },
    rating1: { rating: 1, description: 'Highly Dissatisfied' },
    isDefault: true,
    isReadOnly: true,
    author: 'System',
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
