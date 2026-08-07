import type { QueryBlueprintFromTemplate, QueryKey, QueryParams, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

export interface KPIWithoutTarget {
  id: string
  code: string
  name: string
  status: string
}

export interface ValidationResult {
  isValid: boolean
  totalKPIs: number
  kpisWithTargets: number
  kpisWithoutTargets: number
  kpisNeedingTargets: KPIWithoutTarget[]
}

const endpoint = '/fy-active-kpis/validate-for-assignment'

export const validateForAssignmentRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ValidationResult>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ValidationResult>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
