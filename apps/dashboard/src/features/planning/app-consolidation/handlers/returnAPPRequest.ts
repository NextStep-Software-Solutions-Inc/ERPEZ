/**
 * Return APP Request Handler
 * Mutation blueprint for changing APP status from Submitted back to Draft
 * Used by HoPE to reject/return the APP for revisions
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AppMaster } from '../types'

const endpoint = '/app-consolidation/:appId/return'

interface ReturnAPPPayload {
  appId: string
  returnedAt: string
  returnedBy: string
  returnReason: string
}

export const returnAPPRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AppMaster,
  undefined,
  ReturnAPPPayload
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
      status: 'draft',
      returnedAt: payload.returnedAt,
      returnedBy: payload.returnedBy,
      returnReason: payload.returnReason,
      updatedAt: payload.returnedAt,
    } as any
  },
}
