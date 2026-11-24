import api from '@/services/api'
import type { APIResponse } from 'erpez-shared-lib'

export interface NoticeOfAwardSummary {
  draft: number
  forApproval: number
  returned: number
  approved: number
  openSla: number
  overdueSla: number
  runningTotal: number
}

export const getNoticeOfAwardSummaryRequest = {
  endpoint: '/notice-of-awards/summary',
  key: null,
  fetcher: async (): Promise<NoticeOfAwardSummary> => {
    const response = await api.get<APIResponse<NoticeOfAwardSummary>>('/notice-of-awards/summary')
    return (
      response.data?.data ?? {
        draft: 0,
        forApproval: 0,
        returned: 0,
        approved: 0,
        openSla: 0,
        overdueSla: 0,
        runningTotal: 0,
      }
    )
  },
}
