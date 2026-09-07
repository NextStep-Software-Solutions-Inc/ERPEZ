import type {
  ApiResponse,
  BiddingSchedule,
} from '../types'
import type {
  QueryBlueprintFromTemplate,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/bac/resolutions/:resolutionId/schedule'

export const getBiddingScheduleRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  ApiResponse<BiddingSchedule>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => ['bidding-schedule', url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<ApiResponse<BiddingSchedule>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
