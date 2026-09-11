/**
 * GET /market-scoping-parameter-settings
 * Location: src/features/planning/market-scoping/handlers/
 */

import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  PaginationResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ParameterSettingApiResponse } from '../types/marketScopingApiTypes'

export type { ParameterSettingApiResponse } from '../types/marketScopingApiTypes'

const endpoint = '/market-scoping-parameter-settings' as const

export interface GetParameterSettingsParams extends QueryParams {
  PageNumber?: number
  PageSize?: number
}

/**
 * Fetch market scoping parameter settings from API
 */
export async function fetchParameterSettings(): Promise<
  ParameterSettingApiResponse[]
> {
  try {
    const response = await api.get<
      PaginationResponse<ParameterSettingApiResponse>
    >('/market-scoping-parameter-settings?PageNumber=1&PageSize=100')
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data.filter((item) => item.isActive)
    }
    return []
  } catch (error) {
    console.error('Failed to fetch parameter settings:', error)
    throw error
  }
}

/**
 * Request handler for fetching parameter settings
 */
export const getParameterSettingsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ParameterSettingApiResponse>,
  GetParameterSettingsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<
      PaginationResponse<ParameterSettingApiResponse>
    >(finalUrl, { signal })
    return response.data
  },
}
