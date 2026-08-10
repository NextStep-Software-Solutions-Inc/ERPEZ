import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PPMP } from '../types'

const endpoint = '/ppmps/:id'

export type UpdatePPMPPayload = {
  ppmpNumber?: string
  officeNumber?: string
  fiscalYearId?: string
  fundSourceId?: string
  libId?: string
}

export const updatePPMPRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMP>,
  QueryParams,
  UpdatePPMPPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<PPMP>>(finalUrl, payload)
    return response.data
  },
}
