import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

type SimpleOrganization = {
  id: string
  name: string
  code: string
  type: string
  isActive: boolean
}

const endpoint = '/organizations'

export const getOrganizationsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<SimpleOrganization>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<SimpleOrganization>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
