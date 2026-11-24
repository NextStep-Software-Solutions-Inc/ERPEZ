import type { APIResponse } from 'erpez-shared-lib'
import type { SendPostQualificationNoticePayload } from '../types/bidEvaluationApi.types'
import api from '@/services/api'

export const sendPostQualificationNoticeRequest = {
  endpoint: '/bac/projects/:projectId/evaluation/notice',
  fetcher: async ({
    projectId,
    data,
  }: {
    projectId: string
    data: SendPostQualificationNoticePayload
  }): Promise<{ id: string }> => {
    const response = await api.post<APIResponse<string>>(
      `/bac/projects/${projectId}/evaluation/notice`,
      data
    )
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to send post-qualification notice.')
    }
    return { id: response.data.data }
  },
}
