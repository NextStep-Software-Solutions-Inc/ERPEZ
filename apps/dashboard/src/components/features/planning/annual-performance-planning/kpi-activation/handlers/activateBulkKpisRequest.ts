import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

export interface ActivateBulkKpisPayload {
  fiscalYearId: string
  kpIs: Array<{
    masterKPIId: string
  }>
}

export interface ActivateBulkKpisResponse {
  succeeded: boolean
  message: string
  data: {
    totalActivated: number
    activatedKPIs: Array<{
      id: string
      masterKPIId: string
      fiscalYearId: string
      status: string
    }>
  }
}

const endpoint = '/fy-active-kpis/activate/bulk'

export const activateBulkKpisRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ActivateBulkKpisResponse>,
  undefined,
  ActivateBulkKpisPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ActivateBulkKpisResponse>>(
      finalUrl,
      payload
    )
    return response.data
  },
}
