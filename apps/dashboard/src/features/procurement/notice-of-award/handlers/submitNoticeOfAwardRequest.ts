import {
  findNoticeOfAward,
  replaceNoticeOfAward,
} from '../data/mockNoticeOfAwardData'
import type { SubmitNoticeOfAwardPayload } from '../types'

export const submitNoticeOfAwardRequest = {
  endpoint: '/notice-of-awards/:id/submit',
  key: null,
  fetcher: async ({ data }: { data: SubmitNoticeOfAwardPayload }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 120))

    const noticeOfAward = findNoticeOfAward(data.noaId)

    if (!noticeOfAward) {
      throw new Error('Notice of Award not found.')
    }

    if (
      noticeOfAward.status !== 'draft' &&
      noticeOfAward.status !== 'returned'
    ) {
      throw new Error(
        'Only draft or returned NOAs can be submitted for approval.',
      )
    }

    const updated = {
      ...noticeOfAward,
      status: 'for-approval' as const,
      updatedAt: new Date().toISOString(),
      activityLog: [
        ...noticeOfAward.activityLog,
        {
          id: `${noticeOfAward.id}-log-${noticeOfAward.activityLog.length + 1}`,
          action: 'Submitted for approval',
          actor: 'Procurement Staff',
          timestamp: new Date().toISOString(),
        },
      ],
    }

    return replaceNoticeOfAward(updated)
  },
}
