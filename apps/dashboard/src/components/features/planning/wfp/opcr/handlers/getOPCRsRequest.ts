import type { OPCR, OPCRListResponse } from '../table/types'
import type { APIResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/opcrs'

export const getOPCRsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<OPCR>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<OPCR>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
