import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

type SimpleCategory = {
  id: string
  name: string
  code: string
  canHaveChildren: boolean
  isActive: boolean
}

const endpoint = '/categories'

export const getCategoriesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<SimpleCategory>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<SimpleCategory>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
