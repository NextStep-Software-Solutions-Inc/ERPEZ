import { mockSession } from '@/config/mockSession'
import { useBidEvaluationStore } from '../../bid-evaluation/store/bidEvaluationStore'
import {
  findNoticeOfAward,
  replaceNoticeOfAward,
} from '../data/mockNoticeOfAwardData'
import type { TriggerNoticeOfAwardCascadePayload } from '../types'

export const triggerNoticeOfAwardCascadeRequest = {
  endpoint: '/notice-of-awards/:id/trigger-cascade',
  key: null,
  fetcher: async ({ data }: { data: TriggerNoticeOfAwardCascadePayload }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 120))

    const noticeOfAward = findNoticeOfAward(data.noaId)

    if (!noticeOfAward) {
      throw new Error('Notice of Award not found.')
    }

    if (noticeOfAward.contractExecutionDate) {
      throw new Error('Cascade is unavailable after contract execution.')
    }

    const triggeredAt = new Date().toISOString()
    const triggeredBy = mockSession.user.name?.trim() || 'Procurement Staff'
    const note =
      data.note?.trim() ||
      'Forfeiture of bid security and promotion of the next-ranked bidder initiated.'
    const updated = {
      ...noticeOfAward,
      cascadeTriggeredAt: triggeredAt,
      cascadeTriggeredBy: triggeredBy,
      cascadeNote: note,
      updatedAt: triggeredAt,
      activityLog: [
        ...noticeOfAward.activityLog,
        {
          id: `${noticeOfAward.id}-log-${noticeOfAward.activityLog.length + 1}`,
          action: 'Triggered post-qualification cascade',
          actor: triggeredBy,
          timestamp: triggeredAt,
          note,
        },
      ],
    }

    useBidEvaluationStore.getState().disqualifyAwardedSupplierForNoa({
      projectId: noticeOfAward.linkedBacResolution.sourceBidEvaluationProjectId,
      supplierId:
        noticeOfAward.linkedBacResolution.sourceBidEvaluationSupplierId,
      supplierName: noticeOfAward.supplierName,
      resolutionNumber: noticeOfAward.linkedBacResolution.bacResolutionNumber,
      note,
    })

    return replaceNoticeOfAward(updated)
  },
}
