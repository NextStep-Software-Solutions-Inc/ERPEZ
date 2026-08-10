import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { OPCRActivity } from '../types'
import api from '@/services/api'

const endpoint = '/opcr-activities'

export type CreateOPCRActivityPayload = {
  opcrItemId: string
  name?: string
  description?: string
  budget: number
  PAPDepartmentIds?: Array<string>
}

export const createOPCRActivityRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCRActivity>,
  undefined,
  CreateOPCRActivityPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<OPCRActivity>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
