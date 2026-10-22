import api from '@/services/api'
import type { APIResponse } from 'erpez-shared-lib'
import type { TriggerNoticeOfAwardCascadePayload } from '../types'

export const triggerNoticeOfAwardCascadeRequest = {
  endpoint: '/notice-of-awards/:id/cascade-decision',
  key: null,
  fetcher: async ({
    data,
  }: {
    data: TriggerNoticeOfAwardCascadePayload
  }): Promise<void> => {
    const payload = {
      note: data.note || 'Forfeiture decision recorded for BAC next-ranked bidder evaluation.',
    }

    const response = await api.post<APIResponse<void>>(`/notice-of-awards/${data.noaId}/cascade-decision`, payload)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to record cascade decision.')
    }
  },
}
