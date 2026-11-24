/**
 * Submit AOB Request Handler
 * Submits AOB for BAC Chairperson review (transitions status from Draft/Returned to ForApproval)
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AOB, SubmitAOBPayload } from '../types/aobTypes'
import api from '@/services/api'

const endpoint = '/aobs/:id/submit' as const

export const submitAOBRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AOB,
  undefined,
  Omit<SubmitAOBPayload, 'aobId'>
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const aobIdMatch = finalUrl.match(/\/aobs\/([^\/]+)\/submit/)
    const aobId = aobIdMatch?.[1] || ''
    await api.post<{ succeeded: boolean; message: string }>(finalUrl, {
      aobId,
      submittedBy: payload?.submittedBy,
    })
    return {
      id: aobId,
      status: 'ForApproval',
      submittedAt: new Date().toISOString(),
    } as unknown as AOB
  },
}
