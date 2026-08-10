/**
 * KPI Assignment Grouping Types
 * Types for grouping and aggregating KPI assignments by office and fiscal year
 */

import type { FunctionCategory } from '@/features/planning/master-kpi/types'

/**
 * Aggregated target values for an office
 */
export type AggregatedTargets = {
  annual: number
  q1: number
  q2: number
  q3: number
  q4: number
}

/**
 * Grouped KPI assignments by office
 * Contains aggregated data and metadata for office-level display
 */
export type OfficeGroup = {
  id: string // officeId
  name: string // officeName
  assignmentCount: number // total KPI assignments
  kpiNames: string[] // list of assigned KPI names
  aggregatedTargets: AggregatedTargets
  lockedCount: number // count of locked assignments
  unlockedCount: number // count of unlocked assignments
}

/**
 * Grouped KPI assignments by fiscal year
 * Contains aggregated data for fiscal year-level display
 */
export type FYGroup = {
  fiscalYearId: string
  year?: number
  description?: string
  status?: string
  isLocked?: boolean
  kpiCount: number // count of unique KPIs in this fiscal year
  assignmentCount: number // total assignments in this fiscal year
  aggregatedTargets: AggregatedTargets
  lockedCount: number
  unlockedCount: number
}

/**
 * Grouped KPIs by function category
 * For Level 3 display - groups fyActiveKPIs by their function category
 * functionCategory: Enum value representing Core, Strategic, or Support functions
 */
export type FunctionTypeGroup = {
  functionCategory: FunctionCategory // Type-safe function category from enum
  kpiCount: number // count of unique KPIs in this function category
  assignmentCount: number // total assignments with this function type
  kpiNames: string[] // list of KPI names in this group
  aggregatedTargets: AggregatedTargets
  lockedCount: number
  unlockedCount: number
}
