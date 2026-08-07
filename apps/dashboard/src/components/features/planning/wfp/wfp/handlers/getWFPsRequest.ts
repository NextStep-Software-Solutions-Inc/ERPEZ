import type { WFP } from '../table/types'
import type { APIResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/wfps'

export const getWFPsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<WFP>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<WFP>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
