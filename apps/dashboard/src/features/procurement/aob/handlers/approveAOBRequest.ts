/**
 * Approve AOB Request Handler
 * BAC Chairperson approves AOB with signed document upload
 * Changes AOB status from FOR_APPROVAL to APPROVED
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AOB, AOBApprovalPayload } from '../types/aobTypes'
import api from '@/services/api'
import { mockAOBStore } from '../utils/mockAOBStore'

const endpoint = '/procurement/abstract-of-bids-aob/:id/approve'

export interface ApproveAOBParams {
  id: string
}

export const approveAOBRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AOB,
  ApproveAOBParams,
  Omit<AOBApprovalPayload, 'aobId'>
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    try {
      const response = await api.post<{ data: AOB }>(finalUrl, payload)
      return response.data.data
    } catch (error) {
      // Always throw auth errors (401/403) - never fall back to mock for auth issues
      if (error instanceof Error) {
        const errorMessage = error.message
        if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Unauthorized')) {
          throw new Error(`Authentication error: ${errorMessage}`)
        }
      }

      // Only fall back to mock data in development for other errors
      if (!import.meta.env.DEV) {
        throw error
      }

      // Log the actual error for debugging in development
      console.warn('API error in development mode, falling back to mock approve AOB:', error)
      // Extract aobId from finalUrl (format: /.../:id/approve)
      const aobIdMatch = finalUrl.match(/\/(\w+)\/approve/)
      const aobId = aobIdMatch?.[1] || ''
      return mockAOBStore.approve(
        aobId,
        payload?.approvedBy || 'mock-approver',
        payload?.signedDocumentUrl
      )
    }
  },
}
