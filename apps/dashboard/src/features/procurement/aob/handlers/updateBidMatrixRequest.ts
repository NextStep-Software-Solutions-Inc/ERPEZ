/**
 * Update Bid Matrix Request Handler
 * Updates supplier bids in the bid matrix for manual entries and score updates
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BidMatrix, UpdateBidMatrixPayload } from '../types/aobTypes'
import api from '@/services/api'

const endpoint = '/aobs/:id' as const

export const updateBidMatrixRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  void,
  undefined,
  { aobNumber?: string; description?: string; awardCriterion?: string; aobDate?: string; openingDate?: string }
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const aobIdMatch = finalUrl.match(/\/aobs\/([^\/]+)/)
    const id = aobIdMatch?.[1] || ''
    await api.put(finalUrl, { id, ...payload })
  },
}
