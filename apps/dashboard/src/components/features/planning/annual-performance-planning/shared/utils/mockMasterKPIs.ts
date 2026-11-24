/**
 * Mock KPI Master Library Data
 *
 * Based on SPMS Strategic Planning Master Library
 * Contains all KPI definitions that Planning Officer can select and configure
 */

import type { AggregationMethod } from '@/features/planning/annual-performance-planning/appTypes'

export interface MasterKPI {
  id: string
  code: string
  name: string
  description: string
  functionType: 'CoreFunction' | 'StrategicPriority' | 'MandatorySupport'
  isAvailableForShopping: boolean

  // Master Library specific
  ratingScale: RatingScaleMatrix[]
  defaultAggregation: AggregationMethod
  unitOfMeasure: string
  baselineValue?: number
  targetDirection: 'Increase' | 'Decrease' | 'Maintain'

  // Governance
  ownerOffice: string
  createdBy: string
  createdDate: string
  version: number
  fiscalYear: number // Added fiscalYear property
  status?: string // KPI status (e.g., Draft, Active, Inactive)
  isLocked?: boolean // KPI lock state from backend
  agencyTargetAnnual?: number | null
  agencyTargetQ1?: number | null
  agencyTargetQ2?: number | null
  agencyTargetQ3?: number | null
  agencyTargetQ4?: number | null
}

export interface RatingScaleMatrix {
  rating: number
  label: string
  description: string
  minValue: number
  maxValue: number
}
