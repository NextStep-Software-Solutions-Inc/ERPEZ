import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ProcurementItem } from '../types'

const endpoint = '/procurement-items/:id'

export const getItemMasterRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementItem>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ProcurementItem>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
