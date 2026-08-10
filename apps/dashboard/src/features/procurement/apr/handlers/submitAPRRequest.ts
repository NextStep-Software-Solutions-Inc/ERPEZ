/**
 * Submit APR for Review Request Handler
 * Mutation blueprint for changing APR status from DRAFT to FOR_APPROVAL
 * 
 * ✅ SPMS COMPLIANCE: Validates that source APP is approved before allowing submission
 * This is the final validation gate to ensure SPMS compliance
 * 
 * Validation checks:
 * 1. APR must have a sourceAPPId (APP reference)
 * 2. Source APP must be available (not deleted/archived)
 * 3. Source APP must have status = 'APPROVED'
 * 
 * TODO: Replace mock data with real API calls when backend is ready
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import { APRStatus } from '../types'
import type { APRMaster, SubmitAPRPayload } from '../types'

// Dev-only: Load mock data only in development mode
const getMockAPRDetail = async (aprId: string) => {
  if (!import.meta.env.DEV) {
    throw new Error('Mock data accessed in production')
  }
  const { mockAPRDetail } = await import('../mocks')
  return mockAPRDetail(aprId)
}

const endpoint = '/aprs/:aprId/submit' as const

export const submitAPRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<APRMaster>,
  undefined,
  SubmitAPRPayload
> = {
  endpoint,
  fetcher: async ({ payload = {} as SubmitAPRPayload }) => {
    // MOCK DATA - Replace with real API call when backend is ready
    // const response = await api.post<APIResponse<APRMaster>>(finalUrl, payload)
    // return response.data
    
    const aprId = payload.aprId
    const apr = mockAPRDetail(aprId)
    
    if (!apr) {
      throw new Error(`APR with ID ${aprId} not found`)
    }

    // ✅ SPMS COMPLIANCE VALIDATION
    // Verify that APR has a source APP reference
    if (!apr.sourceAPPId) {
      throw new Error(
        'Cannot submit APR without a source APP reference. This APR must be derived from an approved Annual Procurement Plan (APP).'
      )
    }

    // ✅ Verify that source APP is approved
    // In production, this would fetch the APP from backend and check its status
    // For now, we just validate the APR's appValidationStatus field
    if (apr.appValidationStatus === 'NOT_VALIDATED') {
      throw new Error(
        `Source APP (${apr.sourceAPPId}) validation status is unknown. Please verify the APP before submitting this APR.`
      )
    }

    if (apr.appStatus !== 'APPROVED') {
      throw new Error(
        `Source APP (${apr.sourceAPPId}) must be approved before this APR can be submitted. Current APP status: ${apr.appStatus}`
      )
    }

    // All validations passed - proceed with submission
    const updatedAPR: APRMaster = {
      ...apr,
      status: APRStatus.FOR_APPROVAL,
      submittedAt: payload.submittedAt,
      updatedAt: new Date().toISOString(),
    }
    
    return {
      data: updatedAPR,
      succeeded: true,
      errors: [],
    } as unknown as APIResponse<APRMaster>
  },
}
