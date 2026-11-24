/**
 * Create AOB Request Handler
 * Creates a new Abstract of Bids in DRAFT status with linked RFQs
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AOB, CreateAOBPayload } from '../types/aobTypes'
import api from '@/services/api'

const endpoint = '/aobs'

export const createAOBRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AOB,
  undefined,
  CreateAOBPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<{ data: string }>(finalUrl, {
      aobNumber: payload?.aobNumber,
      description: payload?.description,
      awardCriterion: payload?.awardCriterion || 'LCRB',
      aobDate: payload?.aobDate || payload?.date || new Date().toISOString().split('T')[0],
      openingDate: payload?.openingDate || new Date().toISOString(),
      rfqIds: payload?.rfqIds || [],
    })
    const createdId = response.data.data
    return {
      id: createdId,
      aobNumber: payload?.aobNumber || '',
      description: payload?.description,
      date: payload?.date || new Date().toISOString(),
      openingDate: payload?.openingDate || new Date().toISOString(),
      status: 'Draft',
      awardCriterion: payload?.awardCriterion || 'LCRB',
      rfqIds: payload?.rfqIds || [],
      createdAt: new Date().toISOString(),
    } as AOB
  },
}
