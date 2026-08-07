import { Office } from '@/components/features/planning/office/office/table/types'
import { FYActiveKPIMeasurement } from '../../fiscal-year-and-policies/fy-active-kpi/types/types.measurement'
import { MfoPap } from '@/components/features/planning/mfopap/types'
import { Attribute } from '@/components/features/planning/attribute/types'
import { SDG } from '@/components/features/planning/SDGs/types'
import { FYActiveKPI } from '../../fiscal-year-and-policies/fy-active-kpi/types/types'

export type KPIAssignment = {
  id: string
  fyActiveKPIId: string
  fyActiveKPI?: FYActiveKPI
  officeId: string
  officeName?: string
  assignedTargetAnnual: number | null
  assignedTargetQ1?: number | null
  assignedTargetQ2?: number | null
  assignedTargetQ3?: number | null
  assignedTargetQ4?: number | null
  isLocked: boolean
  FYActiveKPIMeasurements?: FYActiveKPIMeasurement[]
  MFOPAP: MfoPap
  office: Office
  attributes?: Attribute[]
  sdgs?: SDG[]
  createdAt: string
  createdBy: string
  year?: number
}

export type KPIAssignmentDetails = {
  id: string
  fyActiveKPIId: string
  officeId: string
  officeName?: string
  fiscalYearId?: string | null
  year?: number | null
  functionCategory?: string | null
  assignedTargetAnnual?: number
  assignedTargetQ1?: number
  assignedTargetQ2?: number
  assignedTargetQ3?: number
  assignedTargetQ4?: number
  isLocked?: boolean
  fyActiveKPI?: FYActiveKPI & {
    agencyTargetAnnual?: number
    agencyTargetQ1?: number
    agencyTargetQ2?: number
    agencyTargetQ3?: number
    agencyTargetQ4?: number
    FYActiveKPIMeasurements?: FYActiveKPIMeasurement[]
    Attributes?: Attribute[]
    SDGs?: SDG[]
    MFOPAP?: MfoPap
  }
  office?: Office
  createdAt?: string
  createdBy?: string
}
