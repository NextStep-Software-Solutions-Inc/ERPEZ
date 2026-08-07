import { MfoPap } from '@/components/features/planning/mfopap/types'
import { FYActiveKPIMeasurement } from './types.measurement'
import { SDG } from '@/components/features/planning/SDGs/types'
import { Attribute } from '@/lib/opcr'

export type FYActiveKPI = {
  id: string
  fiscalYearId: string
  masterKPIId: string
  parentKPIId?: string
  mfopapId?: string
  name?: string
  code?: string
  description?: string
  measurementUnit?: string
  distributionBehavior?: string
  functionCategory?: string
  monitoringFrequency?: string
  isOptInAvailable: boolean
  isGAD: boolean
  status?: string
  isLocked: boolean
  agencyTargetAnnual: number
  agencyTargetQ1?: number
  agencyTargetQ2?: number
  agencyTargetQ3?: number
  agencyTargetQ4?: number
  createdAt: string
  createdBy?: string
  FYActiveKPIMeasurements?: FYActiveKPIMeasurement[]
  MFOPAP?: MfoPap
  Attributes?: Attribute[]
  SDGs?: SDG[]
}

export type FYActiveKpiDetails = FYActiveKPI & {
  code?: string
}
