import type { FiscalYear } from '../table'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/fiscal-years/:id/unlock'

export const unlockFunctionAllocationRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FiscalYear>,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<FiscalYear>>(finalUrl, payload)
    return response.data
  },
}
