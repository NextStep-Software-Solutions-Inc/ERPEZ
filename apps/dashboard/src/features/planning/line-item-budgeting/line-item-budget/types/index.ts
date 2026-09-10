import { FundSource } from '@/components/features/planning/fund-source'
import { Office } from '@/components/features/planning/office/office/table/types'
import { FiscalYear } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/types/types'
import { LIBActivity } from './type.lib-activity'
import { LIBStatus } from '../utils'

export type { LIBActivity }
export * from './type.office-ceiling'

export type OrphanLineItemDetail = {
  id: string
  objectId: string
  object: {
    id: string
    name?: string
    code?: string
  }
  expenseClass?: {
    id?: string
    name?: string
    code?: string
    type?: string
  } | null
  wfpObjectiveActivityExpenditureId?: string
  wfpObjectiveActivityExpenditure?: {
    id: string
    itemDescription?: string
    quantity?: number
    unitCost?: number
  }
  description?: string
  unitQuantity?: number
  unitCost?: number
  timelineType?: string
  startDate?: string
  endDate?: string
  budget: number
}

export type LIB = {
  id: string
  name: string
  libNumber: string
  sourceType: 'OPCR' | 'WFP'
  sourceId: string
  sourceName: string
  scopeLevel?: 'Activity' | 'Project'
  scope?: 'Activity' | 'Project'
  level?: 'Office' | 'Department'
  fiscalYearId?: string
  fiscalYear?: FiscalYear
  totalAmount: number
  status: LIBStatus
  createdAt: string
  activities: LIBActivity[]
  version: number
  previousVersionId?: string
  fundSourceId?: string
  fundSource?: FundSource
  officeId?: string
  office?: Office
  departmentCeiling?: number | string | null
  ceiling?: number | string | null
  officeCeiling?: { totalAmount?: number | string | null } | null
  agencyMasterBudget?: { id?: string; totalAmount?: number | string | null } | null
  agencyMasterBudgetId?: string | null
  isMultiYear?: boolean
  wfp?: { isMultiYear?: boolean } | null
}

export type LIBDetails = {
  id: string
  fiscalYearId: string
  fundSourceId?: string
  officeId?: string
  parentLIBId?: string
  name?: string
  libNumber?: string
  scope?: 'Activity' | 'Project' | 'ProjectLevel'
  scopeLevel?: 'Activity' | 'Project'
  sourceType?: 'OPCR' | 'WFP'
  sourceId?: string
  status: LIBStatus
  consolidatedIntoLIBId?: string
  totalAmount?: number
  version: number
  previousVersionId?: string
  fiscalYear: FiscalYear
  fundSource: FundSource
  office: Office
  parentLIB?: LIB
  consolidatedIntoLIB?: LIB
  previousVersion?: LIB
  activities?: LIBActivity[]
  orphanDetails?: OrphanLineItemDetail[]
  updatedAt?: string
  createdAt?: string
  departmentCeiling?: number | string | null
  ceiling?: number | string | null
  officeCeiling?: { totalAmount?: number | string | null } | null
  agencyMasterBudget?: { id?: string; totalAmount?: number | string | null } | null
  agencyMasterBudgetId?: string | null
  isMultiYear?: boolean
  wfp?: { isMultiYear?: boolean } | null
}

export type WFPObjectiveActivity = {
  id: string
  name: string
}

export type LineItemBudget = {
  id: string
  fiscalYearId: string
  fundClusterId?: string
  officeId?: string
  parentLIBId?: string
  name: string
  libNumber?: string
  sourceType?: 'OPCR' | 'WFP'
  sourceId?: string
  scope?: 'Activity' | 'Project'
  status?: string
  consolidatedIntoLIBId?: string
  totalAmount?: number
  version: number
  previousVersionId?: string
  fiscalYear?: FiscalYear
  fundCluster?: FundCluster
  office?: Office
  parentLIB?: LineItemBudget
  consolidatedIntoLIB?: LineItemBudget
  previousVersion?: LineItemBudget
  activities?: LIBActivity[]
  orphanDetails?: LineItemBudget[]
}

export type LineItemBudgetHistory = {
  id: string
  libNumber?: string
  version: number
  status?: string
  createdAt: string
  updatedAt?: string
  totalAmount: number
}
export type FundCluster = {
  id: string
  code?: string
  name?: string
}

export type LIBSummaryActivityRow = {
  activityId: string
  activityName: string
  personnelServices: number
  mooe: number
  capitalOutlay: number
  financial: number
  total: number
}

export type LIBSummaryTotals = {
  personnelServices: number
  mooe: number
  capitalOutlay: number
  financial: number
  grand: number
}

export type LIBSummaryUACSRow = {
  objectId: string
  objectCode: string
  objectName: string
  total: number
}

export type LIBSummaryCeilingInfo = {
  psCeiling: number
  mooeCeiling: number
  coCeiling: number
  psConsumed: number
  mooeConsumed: number
  coConsumed: number
  ceilingStatus?: string
}

export type LIBDashboardSummary = {
  libId: string
  libNumber?: string
  name?: string
  status?: string
  version: number
  activities?: LIBSummaryActivityRow[]
  grandTotals: LIBSummaryTotals
  uacsBreakdown?: LIBSummaryUACSRow[]
  ceilingInfo: LIBSummaryCeilingInfo
}

export * from './type'
