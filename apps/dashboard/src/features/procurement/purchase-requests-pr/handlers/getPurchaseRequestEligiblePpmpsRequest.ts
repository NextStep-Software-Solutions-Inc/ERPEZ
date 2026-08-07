/**
 * GET /purchase-requests/{id}/eligible-ppmps
 * Returns PPMP documents (with their items) that can be linked to the given PR.
 * Used in AddItemsModal for Non-CSE PRs.
 *
 * NOTE: No equivalent endpoint exists yet for Out-of-Stock (APR) items.
 * The APR pool continues to use the local store until a backend endpoint is added.
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { EligiblePpmpDocument } from '../types/apiTypes'

const endpoint = '/purchase-requests/:id/eligible-ppmps' as const

export const getPurchaseRequestEligiblePpmpsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<EligiblePpmpDocument[]>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<APIResponse<EligiblePpmpDocument[]>>(finalUrl)
    return response.data
  },
}
