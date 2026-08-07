import type { Office } from '../../../office'

export type OPCRActivityDetail = {
  id: string
  name: string
  description?: string
  budget: number
  activityStatus?: string
  kpiName?: string
}

export type OPCRKPIAssignment = {
  id: string
  kpiId: string
  kpiName?: string
  name?: string
  description?: string
  targetValue?: number
  unitOfMeasure?: string
  status?: string
}

export type OPCREvaluation = {
  id: string
  evaluatorName?: string
  comments?: string
  evaluationDate: string
  status?: string
}

export type OPCR = {
  id: string
  name: string
  office: Office
  officeName?: string
  deliveryUnit?: {
    id: string
    name: string
  }
  fiscalYear: {
    id: string
    year: number
    name?: string
  }
  status: 'Draft' | 'Submitted' | 'Approved' | 'Returned' | 'Pending'
  ratingStatus: string | null
  totalBudget: number
  submittedDate: string | null
  createdDate: string | null
  createdAt?: string
  updatedAt?: string
  activities?: OPCRActivity[]
  opcrActivities?: OPCRActivityDetail[]
  dukpiAssignments?: OPCRKPIAssignment[]
  opcrEvaluations?: OPCREvaluation[]
}

export type OPCRActivity = {
  id: string
  opcrId: string
  name: string
  description: string
  indicator: string
  weight: number
  timelineType?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual'
  quarterlyTargets?: {
    q1: number
    q2: number
    q3: number
    q4: number
  }
  monthlyTargets?: {
    jan: number
    feb: number
    mar: number
    apr: number
    may: number
    jun: number
    jul: number
    aug: number
    sep: number
    oct: number
    nov: number
    dec: number
  }
  weeklyTargets?: Record<string, number>
  dailyTargets?: Record<string, number>
  annualTargets?: {
    annual: number
  }
  targets?: ActivityTarget[]
}

export type ActivityTarget = {
  id: string
  activityId: string
  indicator: string
  targetValue: number
  month: string
  timeline: string
}

export type CreateOPCRCommand = {
  officeId: string
  fiscalYearId: string
  name: string
}

export type OPCRResponse = {
  data: OPCR
}

export type OPCRListResponse = {
  data: OPCR[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
