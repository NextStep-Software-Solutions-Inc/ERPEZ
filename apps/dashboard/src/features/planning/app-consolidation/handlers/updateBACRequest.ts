import type { BACWorkspace } from '../types'
import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/apps/:appId/bac' as const

export interface UpdateBACPayload {
  bac: BACWorkspace
}

/**
 * Updates BAC (Budget Alignment & Procurement) configuration for an APP
 *
 * Mutation Blueprint for updating BAC data in the API
 * Handles:
 * - Mode of Procurement updates
 * - Bidding Schedule Milestones
 * - Remarks and Notes
 * - EPA Eligibility Tags
 *
 * Used in: EditAPPBACDialog when user saves changes
 */
export const updateBACRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BACWorkspace>,  // Response type
  undefined,                  // Middleware (not used)
  UpdateBACPayload            // Payload type
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<BACWorkspace>>(finalUrl, payload)
    return response.data
  },
}
