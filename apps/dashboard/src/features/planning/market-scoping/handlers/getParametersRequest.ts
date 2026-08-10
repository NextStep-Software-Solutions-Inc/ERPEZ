/**
 * Parameter Definitions Management Handlers
 * API request blueprints for CRUD operations on parameter definitions
 * Location: src/features/planning/market-scoping/handlers/
 */

import type {
  ParameterDefinition,
  CreateParameterPayload,
  UpdateParameterPayload,
} from '../types/managementTypes'
import type { QueryBlueprintFromTemplate, MutationBlueprintFromTemplate, PaginationResponse, APIResponse, QueryKey, QueryParams } from 'erpez-shared-lib'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import api from '@/services/api'

export interface ParameterSettingResponse {
  id: string
  name: string
  guidedQuestion: string
  description: string
  sortOrder: number
  isActive: boolean
}

const getParametersEndpoint = '/market-scoping-parameter-settings' as const
const createParameterEndpoint = '/market-scoping-parameter-settings' as const
const updateParameterEndpoint = '/market-scoping-parameter-settings/:id' as const
const deleteParameterEndpoint = '/market-scoping-parameter-settings/:id' as const

// Keep api imported for commented-out real API code below
void api

/**
 * Get all parameter definitions
 * MOCK DATA READY: Returns mock parameters
 * TO SWITCH TO REAL API: Replace the return statement with:
 *   const response = await api.get<APIResponse<ParameterResponse>>(finalUrl);
 *   return response.data;
 */
export const getParametersRequest: QueryBlueprintFromTemplate<
  typeof getParametersEndpoint,
  PaginationResponse<ParameterSettingResponse>,
  QueryParams,
  QueryKey
> = {
  endpoint: getParametersEndpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<PaginationResponse<ParameterSettingResponse>>(finalUrl)
    return response.data
  },
}

/**
 * Create new parameter definition
 * MOCK DATA READY: Returns mock parameter
 * TO SWITCH TO REAL API: Replace the return statement with:
 *   const response = await api.post<APIResponse<{ data: ParameterDefinition }>>('/market-scoping-parameter-settings', payload);
 *   return response.data;
 */
export const createParameterRequest: MutationBlueprintFromTemplate<
  typeof createParameterEndpoint,
  APIResponse<{ data: ParameterDefinition }>,
  undefined,
  CreateParameterPayload
> = {
  endpoint: createParameterEndpoint,
  fetcher: async ({ payload = {} as CreateParameterPayload }) => {
    const response = await api.post<APIResponse<{ data: ParameterDefinition }>>(createParameterEndpoint, payload)
    return response.data
  },
}

/**
 * Update parameter definition
 * MOCK DATA READY: Returns mock updated parameter
 * TO SWITCH TO REAL API: Replace the return statement with:
 *   const response = await api.put<APIResponse<{ data: ParameterDefinition }>>(`/market-scoping-parameter-settings/${id}`, payload);
 *   return response.data;
 */
export const updateParameterRequest = (id: string): MutationBlueprintFromTemplate<
  typeof updateParameterEndpoint,
  APIResponse<{ data: ParameterDefinition }>,
  undefined,
  UpdateParameterPayload
> => ({
  endpoint: updateParameterEndpoint,
  fetcher: async ({ payload = {} as UpdateParameterPayload }) => {
    const response = await api.put<APIResponse<{ data: ParameterDefinition }>>(
      `/market-scoping-parameter-settings/${id}`,
      payload
    )
    return response.data
  },
})

/**
 * Delete parameter definition
 * MOCK DATA READY: Returns success response
 * TO SWITCH TO REAL API: Replace the return statement with:
 *   const response = await api.delete<APIResponse<null>>(`/market-scoping-parameter-settings/${id}`);
 *   return response.data;
 */// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteParameterRequest = (id: string): MutationBlueprintFromTemplate<
  typeof deleteParameterEndpoint,
  APIResponse<null>,
  undefined,
  undefined
> => ({
  endpoint: deleteParameterEndpoint,
  fetcher: async () => {
    const response = await api.delete<APIResponse<null>>(`/market-scoping-parameter-settings/${id}`)
    return response.data
  },
})
