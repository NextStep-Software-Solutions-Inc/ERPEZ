import type { APIResponse } from 'erpez-shared-lib'
import type { CreateBiddingAwardRecommendationPayload } from '../types/bidEvaluationApi.types'
import api from '@/services/api'

export const createBiddingAwardRecommendationRequest = {
  endpoint: '/bac/projects/:projectId/evaluation/recommend-award',
  fetcher: async ({
    projectId,
    data,
  }: {
    projectId: string
    data: CreateBiddingAwardRecommendationPayload
  }): Promise<{ id: string }> => {
    const response = await api.post<APIResponse<string>>(
      `/bac/projects/${projectId}/evaluation/recommend-award`,
      data
    )
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to create bidding award recommendation.')
    }
    return { id: response.data.data }
  },
}
