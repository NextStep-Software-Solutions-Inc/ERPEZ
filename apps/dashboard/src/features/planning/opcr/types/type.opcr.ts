import { DeliveryUnit, Office } from '@/components/features/planning/office'
import { OPCRActivity } from './type.opcr-activity'
import { KPIAssignment } from '../../kpi-assignment'
import { CommitmentStatus } from '../table/approvalworkflow'
import { MasterKPI } from '../../master-kpi/types'
import { FileType } from '@/components/features/planning/file-upload/handlers/createFileRequest'
type FunctionAllocation = {
  id: string
  functionType: string | null
  percentage: number
}

type OPCRFiscalYear = {
  id: string
  year: number
  description: string | null
  isLocked: boolean
  functionAllocations: FunctionAllocation[] | null
}

type KPITargetResponse = {
  id: string
  period: string | null
  quarterName: string | null
  targetValue: number
}

type SubKPI = {
  id: string
  name: string | null
  description: string | null
  functionType: string | null
  SDGs: string[] | null
  allocatedTargetValue: number
}

type DUKPITargetAssignment = {
  id: string
  KPI: MasterKPI
  targets: KPITargetResponse[] | null
  allocatedTargetValue: number
  dateAssigned: string | null
  subKPIs: SubKPI[] | null
}

type OPCRPAPDepartment = {
  id: string
  opcrId: string
  office: Office
}

type DeliveryUnitOffice = {
  id: string
  name: string | null
  code: string | null
}

type OpcrEvaluation = {
  id: string
  opcrId: string
  evaluatorId: string
  evaluationDate: string
  comments: string | null
  status: string | null
  createdAt: string
  createdBy: string | null
}

// ─── List item (GET /opcrs) ───────────────────────────────────────────────────
type OPCR = {
  id: string
  name: string | null
  deliveryUnit: DeliveryUnit
  fiscalYear: OPCRFiscalYear
  status: string | null
  totalBudget: number
  ratingStatus: string | null
  submittedDate: string | null
  returnedDate: string | null
  createdDate: string
  commitmentStatus?: string
  reviewStatus?: string
  opcrEvaluations: OpcrEvaluation[] | null
  dukpiTargetAssignments: DUKPITargetAssignment[] | null
  opcrActivities: OPCRActivity[] | null
  officeName?: string
  officeId?: string
  evaluationCount?: number
  kpiAssignmentCount?: number
  activityCount?: number
  opcrConsolidationId?: string
}

// ─── Detail (GET /opcrs/:id) ──────────────────────────────────────────────────
// The detailed endpoint returns the same rich shape as the list item
type OPCRDetails = OPCR & {
  code?: string
  office: Office
  submittedDate?: string
  returnedDate?: string
  totalBudget: number
  evaluationCount: number
  kpiAssignmentCount: number
  activityCount: number
  opcrEvaluations?: OpcrEvaluation[]
  opcrItems?: OPCRItem[]
  createdAt: string
  createdBy?: string
  createdDate?: string
  updatedAt?: string
  updatedBy?: string
  deliveryUnit?: DeliveryUnit // Legacy nested structure
  fiscalYear: OPCRFiscalYear
  status?: string
  commitmentStatus: CommitmentStatus // 'Draft', 'Submitted', 'Approved', 'Rejected'
  reviewStatus?: ReviewStatus // 'Pending', 'Approved', 'Rejected'
  dukpiTargetAssignments?: DUKPITargetAssignment // Legacy field
  opcrActivities?: OPCRActivity[]
}

type OPCRItem = {
  id: string
  opcrId: string
  kpiAssignmentId: string
  officeId: string
  officeName?: string
  fiscalYearId: string
  fiscalYear: number
  kpiName?: string
  distributionBehavior?: string
  functionCategory?: string
  KPI?: MasterKPI // KPI object
  kpiAssignment?: KPIAssignment & {
    targetAssignments?: Array<{
      id: string
      period?: string
      quarterName?: string
      targetValue: number
    }>
  }
  measurementUnit?: string
  assignedTargetAnnual: number
  assignedTargetQ1?: number
  assignedTargetQ2?: number
  assignedTargetQ3?: number
  assignedTargetQ4?: number
  allocatedTargetValue?: number // Legacy field
  isLocked: boolean
  isShopped: boolean
  q1Target?: number
  q2Target?: number
  q3Target: number
  q4Target: number
  proposedAnnualTarget: number
  createdAt: string
  createdBy?: string
  opcrActivities: OPCRActivity[]

  actualAccomplishment?: string
  justification?: string

  opcrItemRatings?: OPCRItemRating[]
  opcrItemMOVs?: OPCRItemMOV[]
}

type OPCRItemRating = {
  id: string
  opcrItemId: string
  fyActiveKPIMeasurementId: string
  dimension?: string
  selfRating?: number
  pmtRating?: number
  pmtRemark?: string
  createdAt: string
  createdBy?: string
}

type OPCRItemMOV = {
  id: string
  opcrItemId: string
  fyActiveKPIMeasurementId: string
  requirementName: string
  attachedUrl?: FileType
  uploadedDate?: string
  createdAt: string
  createdBy?: string
}

type CommitmentStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected'
type ReviewStatus = 'Pending' | 'Draft' | 'Submitted' | 'Returned' | 'Finalized'

export type {
  OPCR,
  OPCRDetails,
  OPCRFiscalYear,
  DeliveryUnit,
  DeliveryUnitOffice,
  DUKPITargetAssignment,
  MasterKPI,
  KPITargetResponse,
  SubKPI,
  OPCRActivity,
  OPCRPAPDepartment,
  OpcrEvaluation,
  FunctionAllocation,
  CommitmentStatus,
  ReviewStatus,
  OPCRItem,
  OPCRItemRating,
  OPCRItemMOV,
}
