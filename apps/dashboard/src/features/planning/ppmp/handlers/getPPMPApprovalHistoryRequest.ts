import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ApprovalEvent } from '../types'

const endpoint = '/ppmps/:id/approval-history'

export const getPPMPApprovalHistoryRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ApprovalEvent>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ApprovalEvent>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
