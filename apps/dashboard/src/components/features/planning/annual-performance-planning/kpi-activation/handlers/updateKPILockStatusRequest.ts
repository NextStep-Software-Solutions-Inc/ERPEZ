import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

export interface UpdateKPILockStatusPayload {
  isLocked: boolean
}

export interface UpdateKPILockStatusParams {
  fiscalYearId: string
  isLocked: boolean
}

// Direct API call function (not using factory pattern for better control over body)
export const updateKPILockStatus = async (params: UpdateKPILockStatusParams): Promise<void> => {
  const { fiscalYearId, isLocked } = params
  const response = await api.put<APIResponse<void>>(
    `/fy-active-kpis/fiscal-years/${fiscalYearId}/lock-status`,
    { isLocked }
  )
  return response.data.data
}
