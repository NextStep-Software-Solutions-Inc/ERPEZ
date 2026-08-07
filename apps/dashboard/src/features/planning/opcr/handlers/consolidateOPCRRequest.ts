import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { OPCRConsolidate } from '../types'

const endpoint = '/opcr-consolidations'

export type ConsolidateOPCRPayload = {
  opcrIds: string[]
  name: string
}

export const consolidateOPCRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCRConsolidate>,
  undefined,
  ConsolidateOPCRPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<OPCRConsolidate>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
