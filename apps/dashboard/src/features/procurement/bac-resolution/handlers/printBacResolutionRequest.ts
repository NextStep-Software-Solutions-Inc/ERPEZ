import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { PrintBacResolutionResult } from '../types'
import api from '@/services/api'

const endpoint = '/bac-resolutions/:id/print'

export const printBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  PrintBacResolutionResult
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<PrintBacResolutionResult>(finalUrl, payload)
    return response.data
  },
}
