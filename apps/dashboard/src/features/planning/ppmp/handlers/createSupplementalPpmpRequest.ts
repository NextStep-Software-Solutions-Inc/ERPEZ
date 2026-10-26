import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/ppmps/:id/supplemental' as const

export interface CreateSupplementalPpmpPayload {
  ppmpNumber?: string
  description?: string
  copyItems?: boolean
}

export const createSupplementalPpmpRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  CreateSupplementalPpmpPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    return response.data
  },
}
