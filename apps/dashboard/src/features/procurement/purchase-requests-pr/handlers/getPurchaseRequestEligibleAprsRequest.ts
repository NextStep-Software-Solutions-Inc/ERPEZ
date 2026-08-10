/**
 * GET /purchase-requests/{id}/eligible-aprs
 */

import type { QueryBlueprintFromTemplate, APIResponse, QueryKey } from 'erpez-shared-lib'
import api from '@/services/api'

// Add the required response types inline since they might not be in apiTypes.ts yet
export interface EligibleAPRItemResponse {
  aprItemId: string
  itemName: string
  category: string
  fund: string
  unit: string
  unitPrice: number
  monthlyAllocations: Record<string, number>
  totalRequired: number
  currentFulfilled: number
  deficit: number
}

export interface EligibleAPRResponse {
  aprId: string
  aprNumber: string
  officeId: string
  officeName: string
  totalAmount: number
  items: EligibleAPRItemResponse[]
}

const endpoint = '/purchase-requests/:id/eligible-aprs' as const

export const getPurchaseRequestEligibleAprsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<EligibleAPRResponse[]>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<APIResponse<EligibleAPRResponse[]>>(finalUrl)
    return response.data
  },
}
