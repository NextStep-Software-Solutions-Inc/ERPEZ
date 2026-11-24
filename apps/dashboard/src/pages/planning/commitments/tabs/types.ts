import { FiscalYear } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/types/types'
import { FunctionCategory } from '@/features/planning/master-kpi/types'
export type TimelineType = 'Quarterly' | 'Annual' | 'Monthly' | 'Custom'
export type DimensionType = 'Quality' | 'Efficiency' | 'Timeliness'

export interface RatingCriteria {
  rating: 1 | 2 | 3 | 4 | 5
  description: string
}

export interface DimensionCriteria {
  dimensionType: DimensionType
  isMandatory: boolean
  ratingTable: RatingCriteria[]
}

export interface TargetPeriod {
  id: number
  periodName: string // e.g., "Q1", "Q2", "Jan-Mar", "Annual", "Custom Label"
  value: number
  startDate: string
  endDate: string
  isLocked: boolean
}

export interface KPITarget {
  id: string
  kpiId: string
  kpiName: string
  description: string
  dimension: DimensionType // Primary dimension (kept for backward compatibility)
  dimensionCriteria?: DimensionCriteria[] // One or more dimensions with criteria
  functionType: FunctionCategory
  timelineType: TimelineType
  office: string
  fiscalYear: FiscalYear
  isPercentage: boolean
  isFixed: boolean
  isTargetAllocable: boolean
  isAverage: boolean
  isGlobal: boolean
  isActive: boolean
  parentKPIId?: string
  parentKPIName?: string
  // Organization KPI properties
  weight: number
  isMandatory: boolean
  isWeightLocked: boolean
  // Target properties
  isLocked: boolean
  createdBy: 'Planning' | 'DU'
  lastUpdated: string
  // Target Periods (dynamic, not hardcoded to 4)
  targetPeriods: TargetPeriod[]
  // SDG Association
  sdgId?: string
  sdgName?: string
  sdgCode?: string
  sdgDescription?: string
  // Attributes (via KPIAttribute)
  attributes?: {
    id: string
    name: string
    code: string
    description: string
    parentAttributeId?: string
    parentAttributeName?: string
  }[]
}

export interface SubKPI {
  id: string
  name: string
  annualTarget?: number
}

export interface KPICombination {
  kpi: string
  dimension: string
  annualTarget?: number
  subKpis?: SubKPI[]
  status?: string
}

