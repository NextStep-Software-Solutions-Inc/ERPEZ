import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { SupplierDetail, UpdateSupplierStatusPayload } from '../types'

const endpoint = '/suppliers/:id/status'

export const updateSupplierStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SupplierDetail>,
  undefined,
  UpdateSupplierStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<SupplierDetail>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
