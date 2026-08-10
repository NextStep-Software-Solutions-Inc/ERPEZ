import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { SupplierDetail } from '../types'

const endpoint = '/suppliers/:id'

export const getSupplierRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SupplierDetail>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<SupplierDetail>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
