/**
 * Get Allocated APP Item IDs Request Handler
 * 
 * Fetches list of APP Item IDs that are already included in active APRs
 * Used to filter out already-added APPs and line items in APR creation/editing wizard
 */

import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/aprs/allocated-app-item-ids' as const

export interface GetAllocatedAPPItemIdsParams extends QueryParams {
  excludeAprId?: string
}

export const getAllocatedAPPItemIdsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  any,
  GetAllocatedAPPItemIdsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url, excludeAprId }) => [url, excludeAprId || ''] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<any>(finalUrl, { signal })
    return response.data
  },
}
