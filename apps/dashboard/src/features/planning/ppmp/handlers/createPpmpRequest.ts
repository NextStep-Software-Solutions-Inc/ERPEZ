import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PPMP } from '../types'

const endpoint = '/ppmps'

export type CreatePPMPPayload = {
  ppmpNumber?: string
  description?: string
  officeId: string
  fiscalYearId: string
  fundSourceId?: string
  libId: string
  parentId?: string
  isMaster: boolean
  consolidatedIntoId?: string
}
export const createPpmpRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMP>,
  undefined,
  CreatePPMPPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<PPMP>>(finalUrl, payload)
    return response.data
  },
}
