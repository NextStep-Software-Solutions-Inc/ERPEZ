import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { ProcurementMode } from '../procurement-threshold.types'
import api from '@/services/api'

const endpoint = '/procurement-modes'

export type CreateProcurementModePayload = {
  name: string | null
  description: string | null
  procurementCategoryId: string
  minThreshold: number
  maxThreshold?: number | null
}

export const createProcurementModeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementMode>,
  undefined,
  CreateProcurementModePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ProcurementMode>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
