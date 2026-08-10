import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { FiscalMonth } from '../../types'
import api from '@/services/api'

const endpoint = '/fiscal-months/:id/unlock'

export const unlockFiscalMonthRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FiscalMonth>,
  { id: string },
  Record<string, never>
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<FiscalMonth>>(finalUrl, payload || {})
    return response.data
  },
}
