import type {
  ApiResponse,
  BiddingSchedule,
  GenerateSchedulePayload,
} from '../types'
import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/bac/resolutions/:resolutionId/schedule'

export const generateScheduleRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ApiResponse<BiddingSchedule>,
  undefined,
  GenerateSchedulePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<ApiResponse<BiddingSchedule>>(finalUrl, payload)
    return response.data
  },
}
