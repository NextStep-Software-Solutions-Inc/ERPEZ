/**
 * Activity Types Management Handlers
 * API request blueprints for CRUD operations on activity types
 * Location: src/features/planning/market-scoping/handlers/
 */

import type {
  ActivityTypeDefinition,
  CreateActivityTypePayload,
  UpdateActivityTypePayload,
} from '../types/managementTypes'
import type { QueryBlueprintFromTemplate, MutationBlueprintFromTemplate, PaginationResponse, APIResponse, QueryKey, QueryParams } from 'erpez-shared-lib'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import api from '@/services/api'

export interface ActivitySettingResponse {
  id: string
  activityType: string
  label: string
  description: string
  sortOrder: number
  isActive: boolean
}

const getActivityTypesEndpoint = '/market-scoping-activity-settings' as const
const createActivityTypeEndpoint = '/market-scoping-activity-settings' as const
const updateActivityTypeEndpoint = '/market-scoping-activity-settings/:id' as const
const deleteActivityTypeEndpoint = '/market-scoping-activity-settings/:id' as const

// Keep api imported for commented-out real API code below
void api

/**
 * Get all activity type definitions
 * MOCK DATA READY: Returns mock activity types
 * TO SWITCH TO REAL API: Replace the return statement with:
 *   const response = await api.get<APIResponse<ActivityTypeResponse>>(finalUrl);
 *   return response.data;
 */
export const getActivityTypesRequest: QueryBlueprintFromTemplate<
  typeof getActivityTypesEndpoint,
  PaginationResponse<ActivitySettingResponse>,
  QueryParams,
  QueryKey
> = {
  endpoint: getActivityTypesEndpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<PaginationResponse<ActivitySettingResponse>>(finalUrl)
    return response.data
  },
}

/**
 * Create new activity type definition
 * MOCK DATA READY: Returns mock activity type
 * TO SWITCH TO REAL API: Replace the return statement with:
 *   const response = await api.post<APIResponse<{ data: ActivityTypeDefinition }>>('/market-scoping-activity-settings', payload);
 *   return response.data;
 */
export const createActivityTypeRequest: MutationBlueprintFromTemplate<
  typeof createActivityTypeEndpoint,
  APIResponse<{ data: ActivityTypeDefinition }>,
  undefined,
  CreateActivityTypePayload
> = {
  endpoint: createActivityTypeEndpoint,
  fetcher: async ({ payload = {} as CreateActivityTypePayload }) => {
    const response = await api.post<APIResponse<{ data: ActivityTypeDefinition }>>(createActivityTypeEndpoint, payload)
    return response.data
  },
}

/**
 * Update activity type definition
 * MOCK DATA READY: Returns mock updated activity type
 * TO SWITCH TO REAL API: Replace the return statement with:
 *   const response = await api.put<APIResponse<{ data: ActivityTypeDefinition }>>(`/market-scoping-activity-settings/${id}`, payload);
 *   return response.data;
 */
export const updateActivityTypeRequest = (id: string): MutationBlueprintFromTemplate<
  typeof updateActivityTypeEndpoint,
  APIResponse<{ data: ActivityTypeDefinition }>,
  undefined,
  UpdateActivityTypePayload
> => ({
  endpoint: updateActivityTypeEndpoint,
  fetcher: async ({ payload = {} as UpdateActivityTypePayload }) => {
    const response = await api.put<APIResponse<{ data: ActivityTypeDefinition }>>(
      `/market-scoping-activity-settings/${id}`,
      payload
    )
    return response.data
  },
})

/**
 * Delete activity type definition
 * MOCK DATA READY: Returns success response
 * TO SWITCH TO REAL API: Replace the return statement with:
 *   const response = await api.delete<APIResponse<null>>(`/market-scoping-activity-settings/${id}`);
 *   return response.data;
 */// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteActivityTypeRequest = (id: string): MutationBlueprintFromTemplate<
  typeof deleteActivityTypeEndpoint,
  APIResponse<null>,
  undefined,
  undefined
> => ({
  endpoint: deleteActivityTypeEndpoint,
  fetcher: async () => {
    const response = await api.delete<APIResponse<null>>(`/market-scoping-activity-settings/${id}`)
    return response.data
  },
})
