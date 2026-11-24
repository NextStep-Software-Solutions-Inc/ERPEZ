import type { APIResponse } from 'erpez-shared-lib'
import type { LogPostQualificationDocsReceivedPayload } from '../types/bidEvaluationApi.types'
import api from '@/services/api'

export const logPostQualificationDocsReceivedRequest = {
  endpoint: '/bac/projects/:projectId/evaluation/docs-received',
  fetcher: async ({
    projectId,
    data,
  }: {
    projectId: string
    data: LogPostQualificationDocsReceivedPayload
  }): Promise<{ id: string }> => {
    const response = await api.post<APIResponse<string>>(
      `/bac/projects/${projectId}/evaluation/docs-received`,
      data
    )
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to log received post-qualification documents.')
    }
    return { id: response.data.data }
  },
}
