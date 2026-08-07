import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { ProcurementMode } from '../procurement-threshold.types'
import api from '@/services/api'

const endpoint = '/procurement-modes/:id'

export type UpdateProcurementModePayload = {
  name?: string | null
  description?: string | null
  procurementCategoryId?: string | null
  isActive?: boolean | null
  minThreshold?: number
  maxThreshold?: number | null
}

export const updateProcurementModeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementMode>,
  undefined,
  UpdateProcurementModePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<ProcurementMode>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
