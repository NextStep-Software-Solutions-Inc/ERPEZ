/**
 * Get Personnel Positions Request Handler
 * Location: src/features/planning/market-scoping/handlers/
 */

import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  PaginationResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PersonnelPosition } from '../types/marketScopingApiTypes'
export type { PersonnelPosition }

const endpoint = '/personnel-positions' as const

export interface GetPersonnelPositionsParams extends QueryParams {
  PageNumber?: number
  PageSize?: number
  Filters?: string
  Sorts?: string
}

export const getPersonnelPositionsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<PersonnelPosition>,
  GetPersonnelPositionsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<PersonnelPosition>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
