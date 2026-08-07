/**
 * Get Attributes Request Handler
 * GET /attributes - Fetch all KPI Attributes
 */

import type { QueryBlueprintFromTemplate, QueryKey, QueryParams, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

export interface Attribute {
  id: string
  name: string
  code: string
  description?: string
}

const endpoint = '/attributes'

export const getAttributesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<Attribute>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<Attribute>>>(finalUrl, { signal })
    return response.data
  },
}
