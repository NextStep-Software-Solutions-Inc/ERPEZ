/**
 * Delete / Remove Item from APR Request Handler
 * Mutation blueprint for deleting an item via DELETE /aprs/:aprId/items/:itemIdentifier
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/aprs/:aprId/items/:itemIdentifier' as const

export const deleteAPRItemRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<string>>(finalUrl)
    return response.data
  },
}
