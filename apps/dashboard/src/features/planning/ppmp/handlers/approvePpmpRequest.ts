import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/ppmps/:id/approve' as const

export interface ApprovePPMPPayload {
  role?: string
  actorName?: string
  notes?: string
}

export const approvePpmpRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<unknown>,
  { id: string },
  ApprovePPMPPayload | undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<unknown>>(finalUrl, payload)
    return response.data
  },
}
