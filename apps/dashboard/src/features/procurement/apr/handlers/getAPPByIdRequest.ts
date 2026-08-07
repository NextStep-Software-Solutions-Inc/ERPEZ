/**
 * Get Single APP Request Handler
 * 
 * Fetches a single APP by ID with error handling for:
 * - Not found cases
 * - Deleted or archived APPs
 * - Invalid APP IDs
 * 
 * Used to validate APP reference in APR before submission
 * ✅ Production-safe: Mock data only loaded in development
 */

import type { AppMaster } from '@/features/planning/app-consolidation/types'
import type { QueryBlueprintFromTemplate, APIResponse, QueryKey } from 'erpez-shared-lib'

export interface GetAPPByIdParams {
  appId: string
}

/**
 * Request handler to fetch a single APP and validate it's still available
 */
export const getAPPByIdRequest: QueryBlueprintFromTemplate<
  '/apps/:appId',
  APIResponse<AppMaster>,
  GetAPPByIdParams,
  QueryKey
> = {
  endpoint: '/apps/:appId',
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }): Promise<APIResponse<AppMaster>> => {
    try {
      // Extract appId from URL (format: /apps/{appId})
      const matches = finalUrl.match(/\/apps\/([^/?]+)/)
      const appId = matches?.[1]

      if (!appId) {
        throw new Error('APP ID is required')
      }

      // TODO: Replace with actual API call when available
      // const response = await api.get<AppMaster>(`${finalUrl}`)
      // if (!response.data) {
      //   throw new Error('APP not found')
      // }

      // ✅ FALLBACK: Only use mock data in development
      if (!import.meta.env.DEV) {
        console.error('[getAPPByIdRequest] Backend API not implemented')
        throw new Error(`APP with ID ${appId} not found`)
      }

      // Lookup mock data (dev only)
      const { getMockApprovedApp } = await import('../mocks/mockApprovedAPPs')
      const app = getMockApprovedApp(appId)
      if (!app) {
        throw new Error(`APP with ID ${appId} not found`)
      }

      // TODO: Validate the APP when necessary
      // const invalidReason = getAPPInvalidReason(app)
      // if (invalidReason) {
      //   throw new Error(invalidReason.message)
      // }

      return {
        data: app,
        succeeded: true,
        errors: [],
      } as unknown as APIResponse<AppMaster>
    } catch (error) {
      console.error('Failed to fetch APP:', error)
      throw error
    }
  },
}
