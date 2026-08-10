/**
 * Get SDGs Request Handler
 * GET /sdgs - Fetch all Sustainable Development Goals
 */

import type { QueryBlueprintFromTemplate, QueryKey, QueryParams, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

export interface SDG {
  id: string
  name: string
  code: string
  description?: string
}

const endpoint = '/sdgs'

export const getSdgsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<SDG>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  queryParams: { pageSize: 50, PageSize: 50 },
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<SDG>>>(finalUrl, { signal })
    return response.data
  },
}

