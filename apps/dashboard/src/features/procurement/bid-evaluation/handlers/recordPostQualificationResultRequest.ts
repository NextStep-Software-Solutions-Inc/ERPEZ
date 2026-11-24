import type { APIResponse } from 'erpez-shared-lib'
import type { RecordPostQualificationResultPayload } from '../types/bidEvaluationApi.types'
import api from '@/services/api'

export const recordPostQualificationResultRequest = {
  endpoint: '/bac/projects/:projectId/evaluation/post-qual-result',
  fetcher: async ({
    projectId,
    data,
  }: {
    projectId: string
    data: RecordPostQualificationResultPayload
  }): Promise<{ id: string }> => {
    const response = await api.post<APIResponse<string>>(
      `/bac/projects/${projectId}/evaluation/post-qual-result`,
      data
    )
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to record post-qualification result.')
    }
    return { id: response.data.data }
  },
}
