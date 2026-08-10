/**
 * KPIs Request Blueprint
 * 
 * Fetches all or filtered active KPIs from the API
 * GET /fy-active-kpis
 * 
 * Query Parameters:
 * - Filters: Optional filter string (e.g., "fiscalYearId==019d0925-b34c-7d46-8f81-0584adf394af")
 */

import { api } from '@/services/api'
import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'

export interface APIKPI {
  id: string
  fiscalYearId: string
  masterKPIId?: string
  parentKPIId: string | null
  ParentKPI: unknown | null
  mfopapId: string
  name: string
  code: string
  description: string
  measurementUnit: string
  distributionBehavior: 'Summation' | 'Uniform'
  functionCategory: 'Strategic' | 'Core'
  monitoringFrequency: string
  isOptInAvailable: boolean
  isGAD: boolean
  status: string
  isLocked: boolean
  agencyTargetAnnual: number | null
  agencyTargetQ1: number | null
  agencyTargetQ2: number | null
  agencyTargetQ3: number | null
  agencyTargetQ4: number | null
  createdAt: string
  createdBy: string
  FYActiveKPIMeasurements: unknown[]
  KPIMeasurements?: unknown[]
  KPITargets?: unknown[]
  KPIRatings?: unknown[]
  KPIModeOfVerifications?: unknown[]
  MFOPAP: {
    id: string
    parentId: string | null
    name: string
    code: string
    type: string
    isActive: boolean
    fiscalYearId: string | null
  }
  Attributes: unknown[]
  SDGs: unknown[]
}

export interface KPIsPaginatedResponse {
  succeeded: boolean
  message: string | null
  data: APIKPI[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export interface GetKPIsQueryParams {
  Filters?: string
  PageNumber?: number
  PageSize?: number
}

const endpoint = '/fy-active-kpis'

export const getKPIsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  KPIsPaginatedResponse,
  GetKPIsQueryParams
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<KPIsPaginatedResponse>(finalUrl, { signal })
    return response.data
  },
}
