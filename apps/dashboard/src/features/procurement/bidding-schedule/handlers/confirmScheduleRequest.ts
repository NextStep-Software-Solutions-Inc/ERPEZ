import type {
  ApiResponse,
  BiddingSchedule,
  ConfirmSchedulePayload,
} from '../types'
import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/bac/schedules/:scheduleId/confirm'

export const confirmScheduleRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ApiResponse<BiddingSchedule>,
  undefined,
  ConfirmSchedulePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<ApiResponse<BiddingSchedule>>(finalUrl, payload)
    return response.data
  },
}
