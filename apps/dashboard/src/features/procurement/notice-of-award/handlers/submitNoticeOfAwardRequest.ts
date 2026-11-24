import api from '@/services/api'
import type { APIResponse } from 'erpez-shared-lib'
import type { SubmitNoticeOfAwardPayload } from '../types'

export const submitNoticeOfAwardRequest = {
  endpoint: '/notice-of-awards/:id/submit',
  key: null,
  fetcher: async ({ data }: { data: SubmitNoticeOfAwardPayload }): Promise<void> => {
    const response = await api.post<APIResponse<void>>(`/notice-of-awards/${data.noaId}/submit`, {})
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to submit Notice of Award for approval.')
    }
  },
}
