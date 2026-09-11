/**
 * Delete Market Scoping Form
 * Mutation handler - only allowed for Draft status records
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/market-scopings/:id' as const

export const deleteMarketScopingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<null>,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<null>>(finalUrl)
    return response.data
  },
}
