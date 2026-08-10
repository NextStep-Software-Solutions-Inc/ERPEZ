import type { QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { PMTMaximumSeatsSetting } from '@/components/features/planning/organizational-structure/types'
import api from '@/services/api'

const endpoint = '/pmt-maximum-seats'

export interface PMTMaximumSeatsApiResponse {
  succeeded: boolean
  message: string | null
  data: PMTMaximumSeatsSetting[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export const getPMTMaximumSeatsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PMTMaximumSeatsApiResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PMTMaximumSeatsApiResponse>(finalUrl, {
      signal,
    })
    return response.data
  },
}
