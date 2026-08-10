import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { UNSPSCCodeResponse } from '../../types'

const endpoint = '/unspsc-codes'

export const getUnspscCodesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<UNSPSCCodeResponse>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<UNSPSCCodeResponse>>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
