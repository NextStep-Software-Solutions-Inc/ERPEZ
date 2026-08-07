import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { UpdateApplicationEvaluationPayload, SupplierApplicationResponse } from '../types'

export const updateApplicationEvaluationRequest: MutationBlueprintFromTemplate<
  '/procurement-projects/:projectId/applications/:applicationId/evaluation',
  APIResponse<SupplierApplicationResponse>,
  undefined,
  UpdateApplicationEvaluationPayload
> = {
  endpoint: '/procurement-projects/:projectId/applications/:applicationId/evaluation',
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<SupplierApplicationResponse>>(
      finalUrl,
      payload
    )
    return response.data
  },
}
