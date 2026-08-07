import type { WFP } from '../table/types'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/wfps/:id'

export type UpdateWFPPayload = {
  name?: string
  description?: string | null
  linkedOPCRId?: string | null
}

export const updateWFPRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<WFP>,
  undefined,
  UpdateWFPPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<WFP>>(finalUrl, payload)
    return response.data
  },
}
