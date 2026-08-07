import type { QueryBlueprintFromTemplate, APIResponse, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { PMTMaximumSeatsSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/pmt-maximum-seats/:id'

export const getPMTMaximumSeatRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PMTMaximumSeatsSetting>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<PMTMaximumSeatsSetting>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
