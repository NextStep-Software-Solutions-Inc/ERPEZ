import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PPMP } from '../types'

const endpoint = '/ppmps/status'
export type UpdatePPMPStatusPayload = {
  id: string
  action: string
  actorName: string
  role?: string
  notes?: string
}

export const updatePPMPStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMP>,
  undefined,
  UpdatePPMPStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<PPMP>>(finalUrl, payload)
    return response.data
  },
}
