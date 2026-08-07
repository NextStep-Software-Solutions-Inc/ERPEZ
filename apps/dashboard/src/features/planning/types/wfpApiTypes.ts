/**
 * WFP API Response Types
 * Derived from swagger schema: erpez-swagger.json
 * Maps to ERPEZ.Application.Features.Planning.WFP.Dtos namespace
 */

/**
 * Core timeline segment for an activity
 * Represents a single quarterly/monthly/weekly planning period
 */
export interface WFPObjectiveTimelineResponse {
  id: string
  wfpObjectiveTargetId: string
  timelineType: string | null // e.g., "Monthly", "Quarterly", "Weekly"
  startDate: string // ISO date (YYYY-MM-DD)
  endDate: string // ISO date (YYYY-MM-DD)
  targetValue: number
  createdAt: string // ISO datetime
  createdBy: string | null
}

/**
 * Budget item linked to an activity
 */
export interface WFPObjectiveTargetExpenditureResponse {
  id: string
  wfpObjectiveTargetId: string
  object: ObjectResponse
  itemDescription: string | null
  quantity: number
  unitCost: number
  createdAt: string // ISO datetime
  createdBy: string | null
}

/**
 * Single activity/target within an objective
 * Contains one or more timeline segments and budget items
 */
export interface WFPObjectiveTargetResponse {
  id: string
  wfpObjectiveId: string
  activityName: string | null
  indicator: string | null
  weight: number
  createdAt: string // ISO datetime
  createdBy: string | null
  wfpObjectiveTimelines: WFPObjectiveTimelineResponse[] | null
  wfpObjectiveTargetExpenditures: WFPObjectiveTargetExpenditureResponse[] | null
}

/**
 * Objective grouping multiple activities
 */
export interface WFPObjectiveResponse {
  id: string
  wfpId: string
  description: string | null
  weight: number
  outcome: string | null
  createdAt: string // ISO datetime
  createdBy: string | null
  wfpObjectiveTargetsCount: number
  wfpObjectiveTargets: WFPObjectiveTargetResponse[] | null
}

/**
 * Simplified office representation
 */
export interface OfficeResponse {
  id: string
  name: string | null
}

/**
 * Simplified delivery unit representation
 */
export interface DeliveryUnitResponse {
  id: string
  office: OfficeResponse
  parentId: string | null
  createdAt: string // ISO datetime
}

/**
 * Simplified fiscal year representation
 */
export interface FiscalYearResponse {
  id: string
  year: number
  startDate: string // ISO date
  endDate: string // ISO date
}

/**
 * Simplified object/UACS code representation
 */
export interface ObjectResponse {
  id: string
  code: string | null
  name: string | null
}

/**
 * Complete WFP (Work and Financial Plan) response
 * Top-level structure returned from GET /wfps/:id endpoint
 */
export interface WFPResponse {
  id: string
  deliveryUnit: DeliveryUnitResponse
  projectTitle: string | null
  description: string | null
  fiscalYear: FiscalYearResponse | null
  projectStartDate: string // ISO date (YYYY-MM-DD)
  projectEndDate: string // ISO date (YYYY-MM-DD)
  proposedBudget: number | null
  generalObjective: string | null
  status: string | null
  createdAt: string // ISO datetime
  createdBy: string | null
  objectiveCount: number
  activityCount: number
  wfpObjectives: WFPObjectiveResponse[] | null
}
