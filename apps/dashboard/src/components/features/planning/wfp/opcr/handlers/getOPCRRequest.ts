import type { OPCR } from '../table/types'
import type { APIResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/opcrs/:id'

export const getOPCRRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCR>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<OPCR>>(finalUrl, { signal })
    return response.data
  },
}
