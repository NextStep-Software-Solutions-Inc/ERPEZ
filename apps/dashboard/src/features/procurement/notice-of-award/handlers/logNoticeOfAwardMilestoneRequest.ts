import api from '@/services/api'
import type { APIResponse } from 'erpez-shared-lib'
import type { LogNoticeOfAwardMilestonePayload, NoticeOfAwardMilestone } from '../types'

function mapMilestoneTypeToBackend(milestone: NoticeOfAwardMilestone): string {
  switch (milestone) {
    case 'conforme_received_date':
      return 'ConformeReceived'
    case 'performance_security_posted_date':
      return 'PerformanceSecurityPosted'
    case 'contract_execution_date':
      return 'ContractExecuted'
    default:
      return 'ConformeReceived'
  }
}

export const logNoticeOfAwardMilestoneRequest = {
  endpoint: '/notice-of-awards/:id/milestones',
  key: null,
  fetcher: async ({
    data,
  }: {
    data: LogNoticeOfAwardMilestonePayload & { remarks?: string }
  }): Promise<void> => {
    let fileId: string | undefined
    let fileName: string | undefined

    if (data.file) {
      fileName = data.file.name
      const formData = new FormData()
      formData.append('file', data.file)

      const uploadResponse = await api.post<APIResponse<string>>('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (uploadResponse.data?.succeeded && uploadResponse.data.data) {
        fileId = uploadResponse.data.data
      }
    }

    const payload = {
      milestoneType: mapMilestoneTypeToBackend(data.milestone),
      dateLogged: data.date,
      fileId,
      fileName,
      remarks: data.remarks || `Logged milestone for ${data.date}`,
    }

    const response = await api.post<APIResponse<void>>(`/notice-of-awards/${data.noaId}/milestones`, payload)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to log contract milestone.')
    }
  },
}
