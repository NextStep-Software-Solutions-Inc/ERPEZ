import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'

import api from '@/services/api'
import { LIBDetails } from '../types'

const endpoint = '/libs/:id'

export const getLIBRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LIBDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<LIBDetails>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
