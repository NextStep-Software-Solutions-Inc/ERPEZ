/**
 * Get Object Codes Request
 * Fetches paginated list of object codes with expense class
 * 
 * API Endpoint: GET /objects (from erpez-swagger.json)
 */
import type { QueryBlueprintFromTemplate, QueryKey, PaginationResponse, QueryParams } from 'erpez-shared-lib'
import type { ObjectApiResponse } from '../types/objectCodeTypes'
import api from '@/services/api'

const endpoint = '/objects'

export const getObjectCodesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ObjectApiResponse>,
  QueryParams & { fiscalYearId?: string },
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ObjectApiResponse>>(finalUrl, { signal })
    return response.data
  },
}

