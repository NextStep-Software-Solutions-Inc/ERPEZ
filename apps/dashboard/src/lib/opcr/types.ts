import type { Office } from '@/components/features/planning/office'
import { OPCRActivity } from '@/features/planning/opcr'

export type OPCRListItem = {
  id: string
  name: string | null
  officeId: string
  officeName: string | null
  fiscalYear: number
  totalBudget: number
  createdDate: string
  status: string | null
  ratingStatus: string | null
  submittedDate: string | null
  returnedDate: string | null
  evaluationCount: number
  kpiAssignmentCount: number
  activityCount: number
  commitmentStatus?: string
  reviewStatus?: string
}

export interface OPCRItemTargetInfo {
  assignedTargetAnnual: number | null
  assignedTargetQ1: number | null
  assignedTargetQ2: number | null
  assignedTargetQ3: number | null
  assignedTargetQ4: number | null
  q1Target: number | null
  q2Target: number | null
  q3Target: number | null
  q4Target: number | null
}

/** Minimal rating entry as returned inside opcrItems by the API */
export interface OPCRItemRatingEntry {
  id: string
  opcrItemId: string
  fyActiveKPIMeasurementId: string
  dimension?: string | null
  selfRating?: number | null
  pmtRating?: number | null
  pmtRemark?: string | null
  createdAt?: string
}

export interface OPCRItem extends OPCRItemTargetInfo {
  id: string
  opcrId?: string | null
  officeId?: string | null
  officeName: string | null
  fiscalYear: number | string | null
  kpiName: string | null
  measurementUnit: string | null
  distributionBehavior: string | null
  functionCategory?: string | null
  status?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  /** Per-dimension self/PMT ratings — present when API returns full OPCR detail */
  opcrItemRatings?: OPCRItemRatingEntry[]
}

export type FYActiveKPIMeasurement = {
  id: string
  fyActiveKPIId: string
  dimension: string | null
  moVs: string[]
  ratingScaleTemplateId: string | null
  isMOVEditable: boolean
  isScaleEditable: boolean
  createdAt: string
  createdBy: string | null
}

export type MFOPAP = {
  id: string
  parentId: string | null
  name: string | null
  code: string | null
  type: string | null
  isActive: boolean
  fiscalYearId: string | null
}

export type Attribute = {
  id: string
  name: string | null
  code: string | null
  description: string | null
  parentAttributeId: string | null
}

export type SDG = {
  id: string
  name: string | null
  description: string | null
}

export type PAPDepartment = {
  id: string
  opcrActivityId: string
  office: {
    id: string
    positionCount: number
    name: string | null
    code: string | null
    address: string | null
    description: string | null
    responsibilityCenterCode: string | null
    budgetCostCenter: string | null
    officeTypeId: string
    organizationId: string
    categoryId: string
    administrativeLevelId: string
    clusterId: string | null
    procurementWorkflowId: string | null
    parentId: string | null
  }
}

export type OPCRDetails = {
  id: string
  fiscalYearId: string
  masterKPIId: string
  parentKPIId: string | null
  mfopapId: string | null
  name: string | null
  code: string | null
  description: string | null
  measurementUnit: string | null
  distributionBehavior: string | null
  functionCategory: string | null
  monitoringFrequency: string | null
  isOptInAvailable: boolean
  isGAD: boolean
  status: string | null
  isLocked: boolean
  agencyTargetAnnual: number
  agencyTargetQ1: number | null
  agencyTargetQ2: number | null
  agencyTargetQ3: number | null
  agencyTargetQ4: number | null
  fyActiveKPIMeasurements: FYActiveKPIMeasurement[]
  mfopap: MFOPAP
  attributes: Attribute[]
  sdgs: SDG[]
  office: Office
  opcrActivities: OPCRActivity[]
  opcrItems?: OPCRItem[]
  commitmentStatus?: string | null
  reviewStatus?: string | null
  createdAt: string
  createdBy: string | null
  updatedAt: string | null
  updatedBy: string | null
  activityCount: number
}

// Request payload types
export type CreateOPCRPayload = {
  officeId: string
  fiscalYearId: string
  name?: string | null
  code?: string | null
}

export type UpdateOPCRPayload = {
  name?: string | null
  code?: string | null
}

export type UpdateOPCRStatusPayload = {
  status: string | null
}
