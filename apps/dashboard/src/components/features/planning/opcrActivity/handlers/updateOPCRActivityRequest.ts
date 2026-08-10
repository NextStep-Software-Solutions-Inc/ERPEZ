import type {
  MutationBlueprintFromTemplate,
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { OPCRActivity } from '@/features/planning/opcr'

const endpoint = '/opcr-activities/:id'
export type UpdateOPCRActivityPayload = {
  opcrItemId: string
  name?: string
  description?: string
  budget: number
  PAPDepartmentIds?: Array<string>
}
export const updateOPCRActivityRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCRActivity>,
  QueryParams,
  UpdateOPCRActivityPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<OPCRActivity>>(finalUrl, payload)
    return response.data
  },
}
