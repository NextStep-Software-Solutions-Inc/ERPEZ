import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { FiscalYear } from '../types/types'
import api from '@/services/api'

const endpoint = '/fiscal-years'

export type CreateFiscalYearPayload = {
  year: number
  status: 'setup' | 'planning' | 'active' | 'closed'
  description?: string
}

export const createFiscalYearRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FiscalYear>,
  undefined,
  CreateFiscalYearPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<FiscalYear>>(finalUrl, payload)
    return response.data
  },
}
