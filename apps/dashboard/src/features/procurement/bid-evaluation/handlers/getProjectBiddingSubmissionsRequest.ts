import type { APIResponse } from 'erpez-shared-lib'
import type { BiddingSubmissionResponse } from '../types/bidEvaluationApi.types'
import api from '@/services/api'

export const getProjectBiddingSubmissionsRequest = {
  endpoint: '/bac/projects/:projectId/submissions',
  fetcher: async (projectId: string): Promise<Array<BiddingSubmissionResponse>> => {
    const response = await api.get<APIResponse<Array<BiddingSubmissionResponse>>>(
      `/bac/projects/${projectId}/submissions`
    )
    return response.data.data
  },
}
