import type { KPIModeOfVerification } from '../../kpi-mode-of-verifications/types'
import type { Attribute } from '../../attribute/types'
import type { FundSource } from '../../fund-source/table/types'
import type { SDG } from '../../SDGs/types'

// KPI Details type (single KPI response)
export type KPIDetails = {
  id: string
  parentKPIId: string | null
  functionType: string
  name: string
  description: string
  isOfficeMandate: boolean
  isPercentage: boolean
  status: string
  createdAt: string
  createdBy: string
  KPITargets: Array<KPITarget>
  KPIRatings: Array<KPIRating>
  KPIModeOfVerifications: Array<KPIModeOfVerification>
  MFOPAP?: MFOPAP
  Attributes: Array<Attribute>
  SDGs: Array<SDG>
  isTargetValueAllocable: boolean
}

// KPI-related types from API response
export type KPITarget = {
  id: string
  kpiId: string
  targetValue: number
  remainingTargetValue: number
  period: string
  quarterName: string
  createdAt: string
  createdBy: string
}

export type KPIRating = {
  id: string
  kpiId: string
  performanceMeasureId: string
  numericalRating: number
  remarks: string
  createdAt: string
  createdBy: string
}

export type MFOPAP = {
  id: string
  parentId: string | null
  name: string
  code: string
  type: string
  isActive: boolean
}

// Legacy KPI type (keeping for backward compatibility)
export type KPI = {
  id: string
  parentKPIId?: string
  functionType: string // "Core Function" | "Strategic Priority" | "Mandatory Support"
  name: string
  description?: string
  isOfficeMandate: boolean
  isPercentage: boolean
  isTargetValueAllocable: boolean
  /** Count of sub-KPIs under this KPI (optional, returned by list endpoint) */
  subKpisCount?: number
  SDGs?: Array<SDG> // array of sdg ids
  kpiRatings?: Array<KPIRating>
  kpiTargets?: Array<KpiTarget>
  MFOPAPs?: Array<Mfopap> // this is project, can be passed as mfopap type
  MFOPAP?: ''
  Attributes?: Array<Attribute> // this is primary attribute type, if this has children it is mandatory classification in the form displayed.
  kpiMovs?: Array<
    [
      {
        name: string
        description: string
        file?: string
      },
    ]
  >

  // status: 'Active' | 'Inactive'
  // fiscalYear: string
}

export type PerformanceMeasureRating = {
  id: string
  performanceMeasure: PerformanceMeasure
  ratings?: Array<{
    value?: number
    remarks?: string
  }>
}

export type OpcrRating = {
  id: string
  performanceMeasure: PerformanceMeasure
  numericalRating: number
  remarks: string
}
export type PerformanceMeasure = {
  id: string
  name: string
  description?: string
}
// Supporting types
export type KpiRating = {
  id: string
  kpiId: string
  performanceMeasureId: string
  numericalRating: number
  remarks: string
  kpi: string
  performanceMeasure: PerformanceMeasure
}

export type DeliveryUnit = {
  id: string
  officeId: string
  parentDUId: string
  kpiTargetAssignments: Array<string>
  duAllocations: Array<DuAllocation>
  subDeliveryUnits: Array<SubDeliveryUnit>
  wfPs: Array<Wfp>
  wfppapDepartments: Array<WfppapDepartment>
  opcrpapDepartments: Array<OpcrpapDepartment>
  opcRs: Array<Opcr>
  opcrActivities: Array<OpcrActivity>
  office: Office
}

export type DuAllocation = {
  id: string
  deliveryUnitId: string
  purpose: string
  amount: number
  subDUAllocations: Array<SubDuAllocation>
  duFundAllocations: Array<DuFundAllocation>
  deliveryUnit: string
}

export type SubDuAllocation = {
  id: string
  duAllocationId: string
  subDeliveryUnitId: string
  amount: number
  duAllocation: string
  subDeliveryUnit: string
}

export type DuFundAllocation = {
  id: string
  duAllocationId: string
  receivedFundId: string
  amount: number
  duAllocation: string
  receivedFund: ReceivedFund
}

export type ReceivedFund = {
  id: string
  fundSourceId: string
  amount: number
  duFundAllocations: Array<string>
  duAllocations: Array<string>
  fundSource: string
}

export type SubDeliveryUnit = {
  id: string
  deliveryUnitId: string
  name: string
  description: string
  subDeliveryUnitHead: string
  address: string
  email: string
  contactNumber: string
  responsibilityCenterCode: string
  deliveryUnit: string
  subDUAllocations: Array<SubDuAllocation>
  wfppapDepartments: Array<WfppapDepartment>
}

export type WfppapDepartment = {
  id: string
  wfppapId: string
  subDeliveryUnitId: string
  subDeliveryUnit: string
  wfppap: Wfppap
}

export type Wfppap = {
  id: string
  wfpId: string
  wfpOutcomeId: string
  name: string
  outputIndicator: string
  deliverable: string
  timeframe: string
  personsInvolved: Array<string>
  wfp: Wfp
  wfpOutcome: WfpOutcome
  wfppapDepartments: Array<string>
}

export type Wfp = {
  id: string
  deliveryUnitId: string
  programTitle: string
  description: string
  fiscalYear: number
  proposedBudget: number
  generalObjective: string
  status: string
  wfpObjectives: Array<WfpObjective>
  deliveryUnit: string
}

export type WfpOutcome = {
  id: string
  wfpObjectiveId: string
  description: string
  wfpActivities: Array<string>
  wfppaPs: Array<string>
  wfpObjective: string
}

export type ActivityBudgetRequirement = {
  id: string
  wfpObjectiveTargetId: string
  objectId: string
  itemDescription: string
  quantity: number
  unitCost: number
  wfpObjectiveTarget: WfpObjectiveTarget
  object: string
}

export type BudgetObject = {
  id: string
  parentId: string
  name: string
  code: string
  isActive: boolean
  parentObject: string
  objects: Array<string>
  activityBudgetRequirements: Array<ActivityBudgetRequirement>
  transactions: Array<string>
}

export type Transaction = {
  id: string
  fundSourceId: string
  organizationId: string
  locationId: string
  mfopapId: string
  objectId: string
  transactionDate: string
  allotedAmount: number
  obligatedAmount: number
  disbursementAmount: number
  fundSource: FundSource
  organization: Organization
  location: Location
  mfopap: string
  object: BudgetObject
}

export type Organization = {
  id: string
  parentId: string
  name: string
  code: string
  type: string
  isActive: boolean
  parentOrganization: string
  organizations: Array<string>
  transactions: Array<string>
}

export type Location = {
  id: string
  parentId: string
  name: string
  code: string
  type: string
  isActive: boolean
  parentLocation: string
  locations: Array<string>
  transactions: Array<string>
}

export type WfpObjective = {
  id: string
  wfpId: string
  description: string
  weight: number
  wfpOutcomes: Array<WfpOutcome>
  wfpObjectiveTargets: Array<WfpObjectiveTarget>
  wfp: string
}

export type WfpObjectiveTarget = {
  id: string
  wfpObjectiveId: string
  activityName: string
  indicator: string
  weight: number
  wfpObjective: string
  wfpObjectiveTimelines: Array<WfpObjectiveTimeline>
  activityBudgetRequirements: Array<string>
}

export type WfpObjectiveTimeline = {
  id: string
  wfpObjectiveTargetId: string
  startDate: string
  endDate: string
  targetValue: number
  wfpObjectiveTarget: string
}

export type OpcrpapDepartment = {
  id: string
  opcrActivityId: string
  deliveryUnitId: string
  opcrActivity: OpcrActivity
  deliveryUnit: string
}

export type OpcrActivity = {
  id: string
  opcrkpiId: string
  name: string
  description: string
  budget: number
  opcrkpi: Opcrkpi
  deliveryUnits: Array<string>
  opcrpapDepartments: Array<string>
}

export type Opcr = {
  id: string
  deliveryUnitId: string
  fiscalYear: number
  status: string
  deliveryUnit: string
  opcrEvaluations: Array<OpcrEvaluation>
  opcrkpIs: Array<string>
}

export type OpcrEvaluation = {
  id: string
  opcrId: string
  evaluatorId: string
  evaluationDate: string
  comments: string
  status: string
  opcrRatings: Array<string>
  opcr: string
}

export type Opcrkpi = {
  id: string
  kpiId: string
  opcrId: string
  opcr: Opcr
  kpi: string
  opcrActivities: Array<OpcrActivity>
  opcrRatings: Array<OpcrRating>
}

export type Office = {
  id: string
  clusterId: string
  officeHead: string
  name: string
  description: string
  address: string
  email: string
  contactNumber: string
  responsibilityCenterCode: string
  cluster: Cluster
  deliveryUnits: Array<string>
}

export type Cluster = {
  id: string
  name: string
  description: string
  offices: Array<string>
}

export type Mfokpi = {
  id: string
  mfopapId: string
  kpiId: string
  mfopap: Mfopap
  kpi: string
}

export type Mfopap = {
  id: string
  name: string
  description?: string
  parentId?: string
  isActive?: boolean
  code?: string
  type?: string
}

export type KpiTarget = {
  period: string
  value: number
  quarterName: string
}
