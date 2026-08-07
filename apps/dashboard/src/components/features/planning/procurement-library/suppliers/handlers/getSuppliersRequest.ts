import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { SupplierListItem } from '../types'

const endpoint = '/suppliers'

export const getSuppliersRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<SupplierListItem>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<SupplierListItem>>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
