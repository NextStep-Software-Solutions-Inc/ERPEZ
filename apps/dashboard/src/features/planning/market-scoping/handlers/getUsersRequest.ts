/**
 * GET /users
 * Location: src/features/planning/market-scoping/handlers/
 */

import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  PaginationResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { User } from '@/services/api/users'

const endpoint = '/users' as const

export interface GetUsersParams extends QueryParams {
  PageNumber?: number
  PageSize?: number
  Filters?: string
  Sorts?: string
}

/**
 * Request handler for fetching users
 */
export const getUsersRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<User>,
  GetUsersParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<User>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
