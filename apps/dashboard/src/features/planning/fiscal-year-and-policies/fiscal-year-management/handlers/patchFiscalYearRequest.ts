import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryParams,
} from 'erpez-shared-lib'
import type { FiscalYear } from '../types/types'
import api from '@/services/api'

const endpoint = '/fiscal-years/:id/status'

export interface PatchFiscalYearPayload {
  status?: 'setup' | 'planning' | 'active' | 'closed'
  description?: string
}

export const patchFiscalYearRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FiscalYear>,
  QueryParams,
  PatchFiscalYearPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<FiscalYear>>(finalUrl, payload)
    return response.data
  },
}
