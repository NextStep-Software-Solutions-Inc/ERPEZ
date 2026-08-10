import type { PaginationResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

export interface FYActiveKPI {
  id: string
  fiscalYearId: string
  masterKPIId: string
  parentKPIId: string | null
  mfopapId: string
  name: string
  code: string
  description?: string
  measurementUnit: string
  distributionBehavior: string
  functionCategory: string
  monitoringFrequency: string
  isOptInAvailable: boolean
  isGAD: boolean
  status: string
  isLocked: boolean
  agencyTargetAnnual: number
  agencyTargetQ1: number | null
  agencyTargetQ2: number | null
  agencyTargetQ3: number | null
  agencyTargetQ4: number | null
  createdAt: string
  createdBy: string
  FYActiveKPIMeasurements?: any[]
  MFOPAP?: any
  Attributes?: any[]
  SDGs?: any[]
}

const endpoint = '/fy-active-kpis'

export const getFYActiveKPIsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<FYActiveKPI>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<any>(finalUrl, {
      signal,
    })
    return response.data
  },
}
