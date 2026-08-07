import {
  findNoticeOfAward,
  replaceNoticeOfAward,
} from '../data/mockNoticeOfAwardData'
import type { RecordNoticeOfAwardExecutionJustificationPayload } from '../types'

export const recordNoticeOfAwardExecutionJustificationRequest = {
  endpoint: '/notice-of-awards/:id/contract-execution-justification',
  key: null,
  fetcher: async ({
    data,
  }: {
    data: RecordNoticeOfAwardExecutionJustificationPayload
  }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 120))

    const noticeOfAward = findNoticeOfAward(data.noaId)

    if (!noticeOfAward) {
      throw new Error('Notice of Award not found.')
    }

    const justification = data.justification.trim()

    if (!justification) {
      throw new Error('Justification is required.')
    }

    const updatedAt = new Date().toISOString()
    const updated = {
      ...noticeOfAward,
      contractExecutionJustification: justification,
      updatedAt,
      activityLog: [
        ...noticeOfAward.activityLog,
        {
          id: `${noticeOfAward.id}-log-${noticeOfAward.activityLog.length + 1}`,
          action: 'Logged contract execution justification',
          actor: 'Procurement Staff',
          timestamp: updatedAt,
          note: justification,
        },
      ],
    }

    return replaceNoticeOfAward(updated)
  },
}
