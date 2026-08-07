/**
 * SubKPI Types
 * Type definitions for SubKPI entities used throughout the planning module
 */

import type { Attribute } from '../../../attribute/types'

/**
 * SubKPI entity type
 * Represents a sub-level KPI that belongs to a parent KPI
 */
export type SubKPI = {
  /** Unique identifier for the SubKPI */
  id: string
  /** Parent KPI identifier - links to the parent KPI */
  parentKPIId: string
  /** Function type classification */
  functionType: string
  /** Name of the SubKPI */
  name: string
  /** Description of the SubKPI */
  description?: string
  /** Whether this is an office mandate */
  isOfficeMandate: boolean
  /** Whether values are percentage-based */
  isPercentage: boolean
  /** Whether target values can be allocated */
  isTargetValueAllocable: boolean
  /** Status of the SubKPI */
  status?: 'Active' | 'Inactive' | 'Draft' | string
  /** Associated SDG IDs */
  SDGs: Array<string>
  /** KPI ratings configuration */
  kpiRatings: Array<SubKPIRating>
  /** Target values for different periods */
  kpiTargets: Array<SubKPITarget>
  /** Associated MFO/PAPs */
  mfoPaps: Array<SubKPIMfopap>
  /** Associated attributes */
  attributes: Array<Attribute>
  /** Mode of verification documents */
  kpiMovs: Array<SubKPIMov>
  /** Count of nested sub-KPIs (if any) */
  subKpisCount?: number
  /** Created timestamp */
  createdAt?: string
  /** Created by user ID */
  createdBy?: string
}

/**
 * SubKPI Rating type
 */
export type SubKPIRating = {
  id: string
  performanceMeasure: {
    id: string
    name: string
    description?: string
  }
  ratings?: Array<{
    value?: number
    remarks?: string
  }>
}

/**
 * SubKPI Target type
 */
export type SubKPITarget = {
  period: string
  value: number
  quarterName: string
}

/**
 * SubKPI MFO/PAP type
 */
export type SubKPIMfopap = {
  id: string
  name: string
  description?: string
}

/**
 * SubKPI Mode of Verification type
 */
export type SubKPIMov = {
  name: string
  description: string
  file: string
}

/**
 * SubKPI Filter options for table filtering
 */
export type SubKPIFilterOptions = {
  status?: string
  functionType?: string
}

/**
 * SubKPI query params for API requests
 */
export type SubKPIQueryParams = {
  PageNumber: number
  PageSize: number
  ParentKPIId: string
  Filters?: string
}
