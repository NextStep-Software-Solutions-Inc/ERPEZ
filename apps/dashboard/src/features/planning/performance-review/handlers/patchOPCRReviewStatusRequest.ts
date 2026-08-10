import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'

import api from '@/services/api'

const endpoint = '/opcrs/:id/review-status'

export type ReviewStatusEnumString = 'Pending' | 'Draft' | 'Submitted' | 'Returned' | 'Finalized'

export interface PatchOPCRReviewStatusPayload {
  reviewStatus: ReviewStatusEnumString
}

export const patchOPCRReviewStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<any>,
  QueryParams,
  PatchOPCRReviewStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<any>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
