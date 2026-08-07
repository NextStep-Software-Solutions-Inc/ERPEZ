import type { OPCR } from '../table/types'
import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/opcrs'

export type CreateOPCRPayload = {
  deliveryUnitId: string
  fiscalYearId: string
  name: string
}

export const createOPCRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  CreateOPCRPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    return response.data
  },
}
