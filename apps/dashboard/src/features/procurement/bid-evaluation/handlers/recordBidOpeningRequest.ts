import type { APIResponse } from 'erpez-shared-lib'
import type { RecordBidOpeningPayload } from '../types/bidEvaluationApi.types'
import api from '@/services/api'

export const recordBidOpeningRequest = {
  endpoint: '/bac/projects/:projectId/opening',
  fetcher: async ({
    projectId,
    data,
  }: {
    projectId: string
    data: RecordBidOpeningPayload
  }): Promise<{ id: string }> => {
    const response = await api.post<APIResponse<string>>(
      `/bac/projects/${projectId}/opening`,
      data
    )
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to record bid opening.')
    }
    return { id: response.data.data }
  },
}
