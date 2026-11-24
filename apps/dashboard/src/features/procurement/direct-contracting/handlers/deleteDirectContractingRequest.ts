import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/direct-contracting/:id' as const

export const deleteDirectContractingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<void>
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<void>>(finalUrl)
    return response.data
  },
}
