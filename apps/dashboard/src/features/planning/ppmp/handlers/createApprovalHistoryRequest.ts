import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PPMP } from '../types'

const endpoint = '/ppmps/approval-history'

type CreateApprovalHistoryRequestPayload = { ppmpId: string }
export const createApprovalHistoryRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMP>,
  undefined,
  CreateApprovalHistoryRequestPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<PPMP>>(finalUrl, payload)
    return response.data
  },
}
