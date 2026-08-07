/**
 * Add Items to APR Request Handler
 * Mutation blueprint for consolidating selected PPMP/APP items into APR
 * 
 * TODO: Replace mock data with real API calls when backend is ready
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type { APRMaster, ConsolidatedAPRItem } from '../types'

// Dev-only: Load mock data only in development mode
const getMockAPRDetail = async (aprId: string) => {
  if (!import.meta.env.DEV) {
    throw new Error('Mock data accessed in production')
  }
  const { mockAPRDetail } = await import('../mocks')
  return mockAPRDetail(aprId)
}

const endpoint = '/aprs/:aprId/add-items' as const

interface AddItemsToAPRPayload {
  aprId: string
  items: ConsolidatedAPRItem[]
}

export const addItemsToAPRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<APRMaster>,
  undefined,
  AddItemsToAPRPayload
> = {
  endpoint,
  fetcher: async ({ payload = { aprId: '', items: [] } as AddItemsToAPRPayload }) => {
    // TODO: Replace with real API call when backend is ready
    // const response = await api.post<APIResponse<APRMaster>>(finalUrl, payload)
    // return response.data
    
    const aprId = payload.aprId
    
    // ✅ Production-safe: Only use mock data in development
    if (!import.meta.env.DEV) {
      console.error('[APR] Backend API for adding items to APR not yet implemented')
      throw new Error('APR API not available')
    }
    
    const apr = await getMockAPRDetail(aprId)
    
    if (!apr) {
      throw new Error(`APR with ID ${aprId} not found`)
    }
    
    const totalAmount = payload.items.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    )
    
    const updatedAPR: APRMaster = {
      ...apr,
      consolidatedItems: payload.items,
      totalItemsCount: payload.items.length,
      totalAmount,
      updatedAt: new Date().toISOString(),
    }
    
    return {
      data: updatedAPR,
      succeeded: true,
      errors: [],
    } as unknown as APIResponse<APRMaster>
  },
}
