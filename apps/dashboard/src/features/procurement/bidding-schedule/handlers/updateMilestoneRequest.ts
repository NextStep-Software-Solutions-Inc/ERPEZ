import type {
  ApiResponse,
  BiddingSchedule,
  UpdateMilestonePayload,
} from '../types'
import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/bac/schedules/:scheduleId/milestones/:milestoneId'

export const updateMilestoneRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ApiResponse<BiddingSchedule>,
  undefined,
  UpdateMilestonePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<ApiResponse<BiddingSchedule>>(finalUrl, payload)
    return response.data
  },
}
