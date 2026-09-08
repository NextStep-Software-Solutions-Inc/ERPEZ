import type { APIResponse } from 'erpez-shared-lib'
import type { BiddingEvaluationResponse } from '../types/bidEvaluationApi.types'
import api from '@/services/api'

export const getProjectBidEvaluationRequest = {
  endpoint: '/bac/projects/:projectId/evaluation',
  fetcher: async (projectId: string): Promise<BiddingEvaluationResponse> => {
    const response = await api.get<APIResponse<BiddingEvaluationResponse>>(
      `/bac/projects/${projectId}/evaluation`
    )
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to fetch project bid evaluation.')
    }
    return response.data.data
  },
}
