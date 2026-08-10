import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { CreateProcurementItemPayload, ProcurementItem } from '../types'

const endpoint = '/procurement-items'

export const createItemMasterRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementItem>,
  undefined,
  CreateProcurementItemPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ProcurementItem>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
