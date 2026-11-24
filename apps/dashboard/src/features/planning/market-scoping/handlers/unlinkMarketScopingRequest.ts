/**
 * Unlink an MSF from its LIB or LIB Activity target (clears both FK fields)
 * PATCH /market-scopings/{id}/unlink
 *
 * Does NOT delete the MSF — it remains as an independent record.
 * Only the association is cleared.
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/market-scopings/:id/unlink' as const

export const unlinkMarketScopingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<undefined>,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.patch<APIResponse<undefined>>(finalUrl)
    return response.data
  },
}
