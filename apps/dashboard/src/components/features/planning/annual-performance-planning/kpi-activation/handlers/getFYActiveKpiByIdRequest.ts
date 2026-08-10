/**
 * Get FY Active KPI by ID Request Handler
 * GET /fy-active-kpis/{id} - Fetch a specific active KPI with all details
 */

import type { QueryBlueprintFromTemplate, QueryKey, QueryParams, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

export interface FYActiveKpiResponse {
  id: string
  fiscalYearId: string
  fiscalYearName: string
  masterKPIId: string
  parentKPIId: string | null
  mfopapId: string
  name: string
  code: string
  description: string
  measurementUnit: string
  distributionBehavior: string
  functionCategory: string
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
  measurements: Array<{
    id: string
    dimension: string
    ratingScaleTemplateId: string
    moVs: string[]
    isMOVEditable: boolean
    isScaleEditable: boolean
  }>
  assignments: Array<{
    id: string
    officeId: string
    officeName: string
    assignedTargetAnnual: number | null
    assignedTargetQ1: number | null
    assignedTargetQ2: number | null
    assignedTargetQ3: number | null
    assignedTargetQ4: number | null
    isLocked: boolean
  }>
  mfopap: {
    id: string
    parentId: string | null
    name: string
    code: string
    type: string
    isActive: boolean
  }
  attributes: Array<any>
  sdGs: Array<any>
  createdAt: string
}

const endpoint = '/fy-active-kpis/:id'

export const getFYActiveKpiByIdRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FYActiveKpiResponse>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<FYActiveKpiResponse>>(finalUrl, { signal })
    return response.data
  },
}
