import type { BACWorkspace } from '../types'
import type { QueryBlueprintFromTemplate, APIResponse, QueryKey, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/apps/:appId/bac' as const

interface GetBACParams extends QueryParams {
  appId: string
}

/**
 * Fetches BAC (Budget Alignment & Procurement) configuration for an APP
 *
 * Query Blueprint for retrieving existing BAC data from the API
 * Used in: EditAPPBACDialog to load current BAC state
 */
export const getBACRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BACWorkspace>,  // Response type
  GetBACParams,                // Query parameters
  QueryKey                     // Cache key type
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<BACWorkspace>>(finalUrl, { signal })
    return response.data
  },
}
