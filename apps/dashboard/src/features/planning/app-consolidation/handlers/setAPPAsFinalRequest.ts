/**
 * Set APP as Final Request Handler
 * Mutation blueprint for locking an APP and establishing it as the official baseline
 * This can only be done by HoPE after GAA/Budget approval
 * Once set as Final, the APP becomes immutable (read-only)
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AppMaster } from '../types'

const endpoint = '/app-consolidation/:appId/set-as-final'

interface SetAPPAsFinalPayload {
  appId: string
  finalizedAt: string
  finalizedBy: string
  remarks?: string
}

export const setAPPAsFinalRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AppMaster,
  undefined,
  SetAPPAsFinalPayload
> = {
  endpoint,
  fetcher: async ({ payload }) => {
    // TODO: Replace with real API call when backend is ready
    // const response = await api.post(finalUrl, payload)
    // return response.data
    
    if (!payload) throw new Error('Payload is required')
    
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    return {
      status: 'final',
      finalizedAt: payload.finalizedAt,
      finalizedBy: payload.finalizedBy,
      isLocked: true,
      updatedAt: payload.finalizedAt,
    } as any
  },
}
