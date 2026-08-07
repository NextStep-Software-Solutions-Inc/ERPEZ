import {
  findNoticeOfAward,
  replaceNoticeOfAward,
  uploadedNoaFilesMap,
} from '../data/mockNoticeOfAwardData'
import { mockSession } from '@/config/mockSession'
import type { ApproveNoticeOfAwardPayload } from '../types'
import {
  addCalendarDaysToDateOnly,
  NOA_CONTRACT_EXECUTION_SLA_DAYS,
} from '../utils/noaContractExecutionSla'
import { useBidEvaluationStore } from '../../bid-evaluation/store/bidEvaluationStore'

export const approveNoticeOfAwardRequest = {
  endpoint: '/notice-of-awards/:id/approve',
  key: null,
  fetcher: async ({ data }: { data: ApproveNoticeOfAwardPayload }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 120))
    const approvedBy = mockSession.user.name?.trim() || 'Unknown'

    const noticeOfAward = findNoticeOfAward(data.noaId)

    if (!noticeOfAward) {
      throw new Error('Notice of Award not found.')
    }

    if (noticeOfAward.status !== 'for-approval') {
      throw new Error('Only NOAs for approval can be approved.')
    }

    if (
      !data.signedDocument ||
      data.signedDocument.type !== 'application/pdf'
    ) {
      throw new Error('A signed NOA PDF is required before approval.')
    }

    uploadedNoaFilesMap.set(data.noaId, data.signedDocument)

    const issuedAt = new Date().toISOString()
    const philgepsPostedAt = issuedAt.slice(0, 10)
    const updated = {
      ...noticeOfAward,
      status: 'approved' as const,
      approvedBy,
      approvedAt: issuedAt,
      issuedAt,
      contractExecutionDeadline: addCalendarDaysToDateOnly(
        issuedAt,
        NOA_CONTRACT_EXECUTION_SLA_DAYS,
      ),
      signedDocumentFileName: data.signedDocument.name,
      philgepsPostedAt,
      philgepsReferenceNumber:
        noticeOfAward.philgepsReferenceNumber ??
        `PHILGEPS-${noticeOfAward.noaNumber}`,
      updatedAt: issuedAt,
      activityLog: [
        ...noticeOfAward.activityLog,
        {
          id: `${noticeOfAward.id}-log-${noticeOfAward.activityLog.length + 1}`,
          action: 'Approved / Issued with signed document',
          actor: approvedBy,
          timestamp: issuedAt,
          note: data.signedDocument.name,
        },
        {
          id: `${noticeOfAward.id}-log-${noticeOfAward.activityLog.length + 2}`,
          action: 'Logged PhilGEPS NOA posting',
          actor: approvedBy,
          timestamp: issuedAt,
          note: philgepsPostedAt,
        },
      ],
    }

    if (noticeOfAward.linkedBacResolution.sourceBidEvaluationProjectId) {
      useBidEvaluationStore.getState().approveProject(
        noticeOfAward.linkedBacResolution.sourceBidEvaluationProjectId,
      )
    }

    return replaceNoticeOfAward(updated)
  },
}
