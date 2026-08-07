import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { UomLookup } from '../types'

const endpoint = '/uoms'

export const getUomsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<UomLookup>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<UomLookup>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
