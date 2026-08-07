import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { SupplierDetail, UpdateSupplierPayload } from '../types'

const endpoint = '/suppliers/:id'

export const updateSupplierRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SupplierDetail>,
  undefined,
  UpdateSupplierPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<SupplierDetail>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
