import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { WFPDetails } from '../..'

const endpoint = '/wfps/:id'

export const getWFPRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WFPDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<WFPDetails>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
