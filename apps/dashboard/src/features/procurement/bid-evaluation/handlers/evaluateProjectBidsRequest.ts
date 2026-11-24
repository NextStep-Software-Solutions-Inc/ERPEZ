import type { APIResponse } from 'erpez-shared-lib'
import type { EvaluateProjectBidsPayload } from '../types/bidEvaluationApi.types'
import api from '@/services/api'

export const evaluateProjectBidsRequest = {
  endpoint: '/bac/projects/:projectId/evaluation',
  fetcher: async ({
    projectId,
    data,
  }: {
    projectId: string
    data: EvaluateProjectBidsPayload
  }): Promise<{ id: string }> => {
    const response = await api.post<APIResponse<string>>(
      `/bac/projects/${projectId}/evaluation`,
      data
    )
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to evaluate project bids.')
    }
    return { id: response.data.data }
  },
}
