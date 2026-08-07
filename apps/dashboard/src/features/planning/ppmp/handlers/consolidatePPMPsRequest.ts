import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ConsolidatePPMPsPayload, PPMP } from '../types'

const endpoint = '/ppmps/consolidate'

export const consolidatePPMPsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMP>,
  undefined,
  ConsolidatePPMPsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<PPMP>>(finalUrl, payload)
    return response.data
  },
}
