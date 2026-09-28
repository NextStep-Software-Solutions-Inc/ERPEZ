import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'

import api from '@/services/api'
import type { DirectContracting, DirectContractingItemDetails } from '../types'

const endpoint = '/direct-contracting/:id'

export const getDirectContractingRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<DirectContracting & DirectContractingItemDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<DirectContracting & DirectContractingItemDetails>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

