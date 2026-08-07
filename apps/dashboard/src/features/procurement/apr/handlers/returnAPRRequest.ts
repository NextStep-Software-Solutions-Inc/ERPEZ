/**
 * Return APR Request Handler
 * Mutation blueprint for returning APR with remarks (review phase)
 * 
 * TODO: Replace mock data with real API calls when backend is ready
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import { APRStatus } from '../types'
import type { APRMaster, ReturnAPRPayload } from '../types'

// Dev-only: Load mock data only in development mode
const getMockAPRDetail = async (aprId: string) => {
  if (!import.meta.env.DEV) {
    throw new Error('Mock data accessed in production')
  }
  const { mockAPRDetail } = await import('../mocks')
  return mockAPRDetail(aprId)
}

const endpoint = '/aprs/:aprId/return' as const

export const returnAPRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<APRMaster>,
  undefined,
  ReturnAPRPayload
> = {
  endpoint,
  fetcher: async ({ payload = {} as ReturnAPRPayload }) => {
    // MOCK DATA - Replace with real API call when backend is ready
    // const response = await api.post<APIResponse<APRMaster>>(finalUrl, payload)
    // return response.data
    
    const aprId = payload.aprId
    const apr = mockAPRDetail(aprId)
    
    if (!apr) {
      throw new Error(`APR with ID ${aprId} not found`)
    }
    
    const updatedAPR: APRMaster = {
      ...apr,
      status: APRStatus.RETURNED,
      returnedAt: payload.returnedAt,
      returnedBy: 'Reviewer Name',
      returnRemarks: payload.remarks,
      updatedAt: new Date().toISOString(),
    }
    
    return {
      data: updatedAPR,
      succeeded: true,
      errors: [],
    } as unknown as APIResponse<APRMaster>
  },
}
