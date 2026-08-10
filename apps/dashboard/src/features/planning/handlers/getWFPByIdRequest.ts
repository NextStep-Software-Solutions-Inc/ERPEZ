/**
 * Request handler for fetching a single WFP by ID
 * Endpoint: GET /wfps/:id
 */

import type { QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { WFPResponse } from '@/features/planning/types'
import api from '@/services/api'

const endpoint = '/wfps/:id'

export const getWFPByIdRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  WFPResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<WFPResponse>(finalUrl, { signal })
    return response.data
  }
}
