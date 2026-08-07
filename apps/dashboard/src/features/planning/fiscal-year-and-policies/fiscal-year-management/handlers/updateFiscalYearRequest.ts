import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { FiscalYear } from '../types/types'

const endpoint = '/fiscal-years/:id'

export type UpdateFiscalYearPayload = {
  year?: number
  status?: 'setup' | 'planning' | 'active' | 'closed'
  description?: string
}

export const updateFiscalYearRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FiscalYear>,
  { id: string },
  UpdateFiscalYearPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<FiscalYear>>(finalUrl, payload)
    return response.data
  },
}
