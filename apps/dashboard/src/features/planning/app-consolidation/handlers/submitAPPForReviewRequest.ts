/**
 * Submit APP for Review Request Handler
 * Mutation blueprint for changing APP status from Draft to Submitted
 * Used by BAC Secretariat to submit the APP for HoPE approval
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AppMaster } from '../types'

const endpoint = '/app-consolidation/:appId/submit-for-review'

interface SubmitAPPPayload {
  appId: string
  submittedAt: string
  submittedBy: string
  remarks?: string
}

export const submitAPPForReviewRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AppMaster,
  undefined,
  SubmitAPPPayload
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
      status: 'submitted',
      submittedAt: payload.submittedAt,
      submittedBy: payload.submittedBy,
      updatedAt: payload.submittedAt,
    } as any
  },
}
