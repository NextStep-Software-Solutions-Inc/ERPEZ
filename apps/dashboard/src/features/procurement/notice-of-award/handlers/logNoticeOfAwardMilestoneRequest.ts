import {
  findNoticeOfAward,
  replaceNoticeOfAward,
  uploadedMilestoneFilesMap,
} from '../data/mockNoticeOfAwardData'
import { mockSession } from '@/config/mockSession'
import type { LogNoticeOfAwardMilestonePayload, NoticeOfAward } from '../types'

const MILESTONE_FIELD_BY_KEY: Record<
  LogNoticeOfAwardMilestonePayload['milestone'],
  keyof Pick<
    NoticeOfAward,
    | 'conformeReceivedDate'
    | 'performanceSecurityPostedDate'
    | 'contractExecutionDate'
  >
> = {
  conforme_received_date: 'conformeReceivedDate',
  performance_security_posted_date: 'performanceSecurityPostedDate',
  contract_execution_date: 'contractExecutionDate',
}

const MILESTONE_ACTION_BY_KEY: Record<
  LogNoticeOfAwardMilestonePayload['milestone'],
  string
> = {
  conforme_received_date: 'Logged conforme received',
  performance_security_posted_date: 'Logged performance security',
  contract_execution_date: 'Logged contract executed',
}

const MILESTONE_FILE_FIELD_BY_KEY: Record<
  LogNoticeOfAwardMilestonePayload['milestone'],
  keyof Pick<
    NoticeOfAward,
    'conformeFileName' | 'performanceSecurityFileName' | 'contractFileName'
  >
> = {
  conforme_received_date: 'conformeFileName',
  performance_security_posted_date: 'performanceSecurityFileName',
  contract_execution_date: 'contractFileName',
}

export const logNoticeOfAwardMilestoneRequest = {
  endpoint: '/notice-of-awards/:id/contract-execution-milestones',
  key: null,
  fetcher: async ({ data }: { data: LogNoticeOfAwardMilestonePayload }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 120))

    const noticeOfAward = findNoticeOfAward(data.noaId)

    if (!noticeOfAward) {
      throw new Error('Notice of Award not found.')
    }

    if (noticeOfAward.status !== 'approved') {
      throw new Error('NOA must be approved / issued before logging SLA dates.')
    }

    if (!data.date) {
      throw new Error('Milestone date is required.')
    }

    if (!data.file) {
      throw new Error('A supporting file upload is required.')
    }

    const field = MILESTONE_FIELD_BY_KEY[data.milestone]
    const fileField = MILESTONE_FILE_FIELD_BY_KEY[data.milestone]
    const updatedAt = new Date().toISOString()
    const actor = mockSession.user.name?.trim() || 'Procurement Staff'
    const updated = {
      ...noticeOfAward,
      [field]: data.date,
      [fileField]: data.file.name,
      updatedAt,
      activityLog: [
        ...noticeOfAward.activityLog,
        {
          id: `${noticeOfAward.id}-log-${noticeOfAward.activityLog.length + 1}`,
          action: MILESTONE_ACTION_BY_KEY[data.milestone],
          actor,
          timestamp: updatedAt,
          note: `${data.date} - ${data.file.name}`,
        },
      ],
    }

    uploadedMilestoneFilesMap.set(`${data.noaId}-${data.milestone}`, data.file)

    return replaceNoticeOfAward(updated)
  },
}
