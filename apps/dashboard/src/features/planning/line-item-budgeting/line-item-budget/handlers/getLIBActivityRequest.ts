import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { LIBActivity } from '../types'

const endpoint = '/lib-activities/:id'

export const getLIBActivityRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<LIBActivity>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<LIBActivity>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
