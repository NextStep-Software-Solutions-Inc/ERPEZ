/**
 * GET /market-scoping-activity-settings
 * Location: src/features/planning/market-scoping/handlers/
 */

import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  PaginationResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ActivitySettingApiResponse } from '../types/marketScopingApiTypes'

export type { ActivitySettingApiResponse } from '../types/marketScopingApiTypes'

const endpoint = '/market-scoping-activity-settings' as const

export interface GetActivitySettingsParams extends QueryParams {
  PageNumber?: number
  PageSize?: number
}

/**
 * Fetch market scoping activity settings from API
 */
export async function fetchActivitySettings(): Promise<
  ActivitySettingApiResponse[]
> {
  try {
    const response = await api.get<
      PaginationResponse<ActivitySettingApiResponse>
    >('/market-scoping-activity-settings?PageNumber=1&PageSize=100')
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data.filter((item) => item.isActive)
    }
    return []
  } catch (error) {
    console.error('Failed to fetch activity settings:', error)
    throw error
  }
}

/**
 * Request handler for fetching activity settings
 */
export const getActivitySettingsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ActivitySettingApiResponse>,
  GetActivitySettingsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<
      PaginationResponse<ActivitySettingApiResponse>
    >(finalUrl, { signal })
    return response.data
  },
}
