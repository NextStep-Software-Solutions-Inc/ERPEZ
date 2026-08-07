import type {
  MutationBlueprintFromTemplate,
  QueryParams,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/opcr-activities/:activityId/expenditures'

export interface CreateOPCRActivityExpenditurePayload {
  amount: number
  description: string
  date: string
}

export const createOPCRActivityExpenditureRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<{ id: string }>,
  QueryParams,
  CreateOPCRActivityExpenditurePayload
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<{ id: string }>>(finalUrl, payload)
    return response.data
  },
}