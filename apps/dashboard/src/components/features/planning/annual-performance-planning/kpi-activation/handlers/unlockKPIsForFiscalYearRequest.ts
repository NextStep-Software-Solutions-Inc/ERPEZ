import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/fiscal-years/:id/unlock'

export const unlockKPIsForFiscalYearRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<void>,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<void>>(finalUrl)
    return response.data
  },
}
