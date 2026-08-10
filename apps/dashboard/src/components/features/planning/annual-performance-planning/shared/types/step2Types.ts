/**
 * KPI Activation (Step 2) Type Definitions
 * 
 * Types for managing KPI selection, activation, and aggregation customization
 */

import type { MasterKPI } from '../../shared/utils/mockMasterKPIs'
import type { AggregationMethod } from '@/features/planning/annual-performance-planning/appTypes'

/**
 * Represents a KPI that has been activated/selected for a fiscal year
 * Includes configuration such as aggregation method and modification status
 */
export type ActiveKPI = {
  id: string
  name: string
  code: string
  description?: string
  functionType: string
  defaultAggregation: AggregationMethod
  aggregationMethod: AggregationMethod
  isModified: boolean
  isLocked?: boolean
  masterKPI: MasterKPI
}

/**
 * Tracks custom aggregation method and modification notes for a specific KPI
 * Used when user overrides the default aggregation behavior
 */
export type KPIAggregationCustomization = {
  kpiId: string
  method: AggregationMethod
  modificationNotes?: string
}
