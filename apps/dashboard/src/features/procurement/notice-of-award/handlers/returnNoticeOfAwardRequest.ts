import {
  findNoticeOfAward,
  replaceNoticeOfAward,
} from '../data/mockNoticeOfAwardData'
import type { ReturnNoticeOfAwardPayload } from '../types'

export const returnNoticeOfAwardRequest = {
  endpoint: '/notice-of-awards/:id/return',
  key: null,
  fetcher: async ({ data }: { data: ReturnNoticeOfAwardPayload }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 120))

    const noticeOfAward = findNoticeOfAward(data.noaId)

    if (!noticeOfAward) {
      throw new Error('Notice of Award not found.')
    }

    if (noticeOfAward.status !== 'for-approval') {
      throw new Error('Only NOAs for approval can be returned.')
    }

    if (!data.remarks.trim()) {
      throw new Error('Remarks are required before returning the NOA.')
    }

    const updated = {
      ...noticeOfAward,
      status: 'returned' as const,
      returnReason: data.remarks.trim(),
      updatedAt: new Date().toISOString(),
      activityLog: [
        ...noticeOfAward.activityLog,
        {
          id: `${noticeOfAward.id}-log-${noticeOfAward.activityLog.length + 1}`,
          action: 'Returned for revision',
          actor: 'HOPE',
          timestamp: new Date().toISOString(),
          note: data.remarks.trim(),
        },
      ],
    }

    return replaceNoticeOfAward(updated)
  },
}
