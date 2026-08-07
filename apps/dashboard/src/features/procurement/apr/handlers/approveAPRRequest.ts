/**
 * Approve APR Request Handler
 * Mutation blueprint for approving APR with signed document upload
 * 
 * TODO: Replace mock data with real API calls when backend is ready
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import { APRStatus } from '../types'
import type { APRMaster, ApproveAPRPayload } from '../types'

// Dev-only: Load mock data only in development mode
const getMockAPRDetail = async (aprId: string) => {
  if (!import.meta.env.DEV) {
    throw new Error('Mock data accessed in production')
  }
  const { mockAPRDetail } = await import('../mocks')
  return mockAPRDetail(aprId)
}

const endpoint = '/aprs/:aprId/approve' as const

export const approveAPRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<APRMaster>,
  undefined,
  ApproveAPRPayload
> = {
  endpoint,
  fetcher: async ({ payload = {} as ApproveAPRPayload }) => {
    // MOCK DATA - Replace with real API call when backend is ready
    // const formData = new FormData()
    // formData.append('signedDocument', payload.signedDocumentFile)
    // formData.append('approvedAt', payload.approvedAt)
    // const response = await api.post<APIResponse<APRMaster>>(finalUrl, formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' },
    // })
    // return response.data
    
    if (!payload) throw new Error('Payload is required')
    
    const aprId = payload.aprId
    const apr = mockAPRDetail(aprId)
    
    if (!apr) {
      throw new Error(`APR with ID ${aprId} not found`)
    }
    
    const updatedAPR: APRMaster = {
      ...apr,
      status: APRStatus.APPROVED,
      approvedAt: payload.approvedAt,
      approvedBy: 'Approver Name',
      signedDocumentUrl: `/documents/apr-${aprId}-signed.pdf`, // Mock URL
      updatedAt: new Date().toISOString(),
    }
    
    return {
      data: updatedAPR,
      succeeded: true,
      errors: [],
    } as unknown as APIResponse<APRMaster>
  },
}
