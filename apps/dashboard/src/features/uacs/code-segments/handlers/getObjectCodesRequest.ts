/**
 * Get Object Codes Request
 * Fetches paginated list of object codes with expense class
 * 
 * API Endpoint: GET /objects (from erpez-swagger.json)
 */
import type { QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { ObjectApiResponse, PaginatedObjectApiResponse } from '../types/objectCodeTypes'
import api from '@/services/api'

const endpoint = '/objects'

export const getObjectCodesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginatedObjectApiResponse,
  QueryParams & { fiscalYearId?: string },
  QueryKey
> = {
  endpoint,
  key: ({ queryParams }) => [endpoint, queryParams] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginatedObjectApiResponse>(finalUrl, { signal })
    return response.data
  },
}

