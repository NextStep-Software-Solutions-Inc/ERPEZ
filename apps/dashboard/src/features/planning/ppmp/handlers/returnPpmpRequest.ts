import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/ppmps/:id/return' as const

export interface ReturnPPMPPayload {
  remarks: string
  role?: string
  actorName?: string
}

export const returnPpmpRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<unknown>,
  { id: string },
  ReturnPPMPPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<unknown>>(finalUrl, payload)
    return response.data
  },
}
