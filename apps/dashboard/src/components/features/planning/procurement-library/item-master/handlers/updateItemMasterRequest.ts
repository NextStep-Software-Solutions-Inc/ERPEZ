import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ProcurementItem, UpdateProcurementItemPayload } from '../types'

const endpoint = '/procurement-items/:id'

export const updateItemMasterRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementItem>,
  undefined,
  UpdateProcurementItemPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<ProcurementItem>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
