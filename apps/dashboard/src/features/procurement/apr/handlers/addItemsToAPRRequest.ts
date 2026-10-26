/**
 * Add Catalog Items to APR Request Handler
 * Mutation blueprint for saving selected PSDBM catalog items to an APR via POST /aprs/:aprId/catalog-items
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/aprs/:aprId/catalog-items' as const

export interface CatalogItemPayload {
  itemCode: string
  description: string
  unit?: string
  unitPrice: number
  quantity: number
}

export interface AddCatalogItemsToAPRPayload {
  aprId: string
  items: CatalogItemPayload[]
}

export const addItemsToAPRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  AddCatalogItemsToAPRPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('addItemsToAPRRequest: Payload is required')
    }
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    return response.data
  },
}
