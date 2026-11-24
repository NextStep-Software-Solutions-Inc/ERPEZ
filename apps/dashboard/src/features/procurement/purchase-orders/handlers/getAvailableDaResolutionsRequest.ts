/**
 * GET /direct-acquisitions/available-for-po
 * List approved Direct Acquisition BAC Resolutions ready for PO creation.
 */

import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { AvailableDaResolution } from '../types'

const endpoint = '/direct-acquisitions/available-for-po' as const

export const getAvailableDaResolutionsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  AvailableDaResolution[],
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<AvailableDaResolution[]>>(finalUrl, { signal })
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to fetch available Direct Acquisitions.')
    }
    return response.data.data ?? []
  },
}
