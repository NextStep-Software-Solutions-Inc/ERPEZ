/**
 * Get Single APP Request Handler
 * 
 * Fetches a single APP by ID with line items from backend GET /apps/:appId
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { BackendAPPResponse } from './getApprovedAPPsRequest'

const endpoint = '/apps/:appId' as const

export interface GetAPPByIdParams extends QueryParams {
  appId: string
}

export const getAPPByIdRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BackendAPPResponse>,
  GetAPPByIdParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<BackendAPPResponse>>(finalUrl, { signal })
    return response.data
  },
}
