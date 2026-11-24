import api from '@/services/api'
import type { APIResponse } from 'erpez-shared-lib'
import type { RecordNoticeOfAwardExecutionJustificationPayload } from '../types'

export const recordNoticeOfAwardExecutionJustificationRequest = {
  endpoint: '/notice-of-awards/:id/justification',
  key: null,
  fetcher: async ({
    data,
  }: {
    data: RecordNoticeOfAwardExecutionJustificationPayload
  }): Promise<void> => {
    const payload = {
      justification: data.justification,
    }

    const response = await api.post<APIResponse<void>>(`/notice-of-awards/${data.noaId}/justification`, payload)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to log overdue justification.')
    }
  },
}
