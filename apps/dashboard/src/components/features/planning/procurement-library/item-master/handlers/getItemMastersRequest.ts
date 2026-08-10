import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ProcurementItem } from '../types'

const endpoint = '/procurement-items'

export const getItemMastersRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<ProcurementItem>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<ProcurementItem>>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
