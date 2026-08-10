import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { SupplierCategoryInfo } from '../types'

const endpoint = '/supplier-categories'

export const getSupplierCategoriesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<SupplierCategoryInfo>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<SupplierCategoryInfo>>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
