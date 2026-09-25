import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'

import api from '@/services/api'
import type { DirectContracting } from '../types'

const endpoint = '/direct-contracting/:id'

export const getDirectContractingRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<DirectContracting>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<DirectContracting>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

