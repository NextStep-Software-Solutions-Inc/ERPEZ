import api from '@/services/api'
import type { APIResponse } from 'erpez-shared-lib'
import type { ReturnNoticeOfAwardPayload } from '../types'

export const returnNoticeOfAwardRequest = {
  endpoint: '/notice-of-awards/:id/return',
  key: null,
  fetcher: async ({ data }: { data: ReturnNoticeOfAwardPayload }): Promise<void> => {
    const payload = {
      remarks: data.remarks,
    }

    const response = await api.post<APIResponse<void>>(`/notice-of-awards/${data.noaId}/return`, payload)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to return Notice of Award.')
    }
  },
}
