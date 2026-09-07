import type {
  ApiResponse,
  BiddingSchedule,
  LockSchedulePayload,
} from '../types'
import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/bac/schedules/:scheduleId/lock'

export const lockScheduleRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ApiResponse<BiddingSchedule>,
  undefined,
  LockSchedulePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<ApiResponse<BiddingSchedule>>(finalUrl, payload)
    return response.data
  },
}
