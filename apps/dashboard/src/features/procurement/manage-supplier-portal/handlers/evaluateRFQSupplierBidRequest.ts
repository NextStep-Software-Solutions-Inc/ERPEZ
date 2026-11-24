import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { UpdateRFQBidEvaluationPayload, RFQSupplierBidResponse } from '../types'

export const evaluateRFQSupplierBidRequest: MutationBlueprintFromTemplate<
  '/rfqs/:rfqId/bids/:bidId/evaluation',
  APIResponse<RFQSupplierBidResponse>,
  undefined,
  UpdateRFQBidEvaluationPayload
> = {
  endpoint: '/rfqs/:rfqId/bids/:bidId/evaluation',
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<RFQSupplierBidResponse>>(
      finalUrl,
      payload
    )
    return response.data
  },
}
