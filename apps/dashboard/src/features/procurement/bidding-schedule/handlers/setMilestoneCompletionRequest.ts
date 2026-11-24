import type {
  ApiResponse,
  BiddingSchedule,
  SetMilestoneCompletionPayload,
} from '../types'
import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/bac/schedules/:scheduleId/milestones/:milestoneId/complete'

export const setMilestoneCompletionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ApiResponse<BiddingSchedule>,
  undefined,
  SetMilestoneCompletionPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<ApiResponse<BiddingSchedule>>(finalUrl, payload)
    return response.data
  },
}
