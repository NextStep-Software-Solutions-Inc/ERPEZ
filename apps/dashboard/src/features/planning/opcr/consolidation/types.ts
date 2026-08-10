/**
 * OPCR Agency-Wide Consolidation Data Types
 * 
 * Hierarchy:
 * OPCR (Office OPCR submission)
 *  ├─ KPI (Master KPI Code)
 *  │  ├─ Activity (from specific office)
 *  │  │  ├─ Q1-Q4 Targets
 *  │  │  ├─ Annual Target
 *  │  │  └─ Proposed Budget
 */

// Activity: Smallest unit with Q1-Q4 breakdown
export interface ConsolidationActivity {
  id: string
  description: string
  officeId: string
  officeName: string
  proposedBudget: number
  q1: number
  q2: number
  q3: number
  q4: number
  annualTarget: number
  uom: string // Unit of Measure
}

// KPI within OPCR: Contains activities and office contribution data
export interface OpcrKPI {
  id: string
  masterKpiCode: string
  kpiTitle: string
  behaviorTag: 'SUM' | 'AVG'
  activities: ConsolidationActivity[] // Activities for this KPI
  agencyTarget: number // Target for consolidated view
}

// Office OPCR: Contains KPIs with activities
export interface OfficeOpcr {
  id: string
  opcrId: string
  officeName: string
  officeId: string
  status: 'Draft' | 'Pending' | 'Approved' | 'Returned' | 'Submitted'
  approvedDate: string
  kpis: OpcrKPI[] // KPIs in this office OPCR
  totalBudget: number
  totalKpis: number
  totalActivities: number
}

// Consolidated view: KPI with all office contributions
export interface ConsolidatedKPI {
  masterKpiCode: string
  kpiTitle: string
  behaviorTag: 'SUM' | 'AVG'
  agencyTarget: number
  consolidatedTotal: number
  officeContributions: OfficeContribution[]
  isValid: boolean
  validationError?: string
}

// Office contribution to a consolidated KPI
export interface OfficeContribution {
  officeId: string
  officeName: string
  annualTarget: number
  q1: number
  q2: number
  q3: number
  q4: number
  budget: number
  activities: ConsolidationActivity[]
  isValid: boolean
  quarterlyMismatch?: number
}

// Consolidated snapshot
export interface ConsolidationSnapshot {
  id: string
  fiscalYear: string
  createdAt: string
  status: 'DRAFT' | 'CONSOLIDATED' | 'FINALIZED'
  selectedOpcrIds: string[]
  consolidatedKpis: ConsolidatedKPI[]
  agencyMetrics: {
    totalKpis: number
    totalActivities: number
    totalBudget: number
    validKpis: number
  }
}

// Validation result
export interface ValidationResult {
  isValid: boolean
  level1Valid: boolean
  level2Valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: 'LEVEL_1_MISMATCH' | 'LEVEL_2_MISMATCH'
  kpiCode: string
  officeName?: string
  message: string
  deficit?: number
  actual?: number
  expected?: number
}

export interface ValidationWarning {
  type: 'QUARTERLY_MISMATCH'
  kpiCode: string
  officeName: string
  message: string
  discrepancy: number
}
