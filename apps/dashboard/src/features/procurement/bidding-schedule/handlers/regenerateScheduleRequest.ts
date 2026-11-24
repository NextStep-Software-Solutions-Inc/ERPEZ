import type {
  ApiResponse,
  BiddingSchedule,
  RegenerateSchedulePayload,
} from '../types'
import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/bac/resolutions/:resolutionId/schedule/regenerate'

export const regenerateScheduleRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ApiResponse<BiddingSchedule>,
  undefined,
  RegenerateSchedulePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<ApiResponse<BiddingSchedule>>(finalUrl, payload)
    return response.data
  },
}
