/**
 * Get APR Details Request Handler
 * Query blueprint for fetching a single APR by ID
 * Connects directly to backend GET /aprs/:aprId
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { APRDetailDto } from '../types'

const endpoint = '/aprs/:aprId' as const

export interface GetAPRParams extends QueryParams {
  aprId: string
}

export const getAPRRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<APRDetailDto>,
  GetAPRParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<APRDetailDto>>(finalUrl, { signal })
    return response.data
  },
}
