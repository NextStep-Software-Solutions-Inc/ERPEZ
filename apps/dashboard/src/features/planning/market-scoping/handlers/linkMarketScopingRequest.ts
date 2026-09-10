/**
 * Link an MSF to a LIB or LIB Activity (patch-style — only updates target FK fields)
 * PATCH /market-scopings/{id}/link
 *
 * Does NOT touch MSF activities or parameters.
 * Validates mutual exclusivity, LIB scope, and office authorization on the backend.
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type { LinkMarketScopingRequest as LinkPayload } from '../types/marketScopingApiTypes'
import api from '@/services/api'

const endpoint = '/market-scopings/:id/link' as const

export const linkMarketScopingRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<undefined>,
  { id: string },
  LinkPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<undefined>>(finalUrl, payload)
    return response.data
  },
}
