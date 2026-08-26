/**
 * Return AOB Request Handler
 * BAC Chairperson returns AOB to BAC Secretariat with required revision remarks
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AOB, AOBReturnPayload } from '../types/aobTypes'
import api from '@/services/api'

const endpoint = '/aobs/:id/return' as const

export const returnAOBRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AOB,
  undefined,
  Omit<AOBReturnPayload, 'aobId'>
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const aobIdMatch = finalUrl.match(/\/aobs\/([^\/]+)\/return/)
    const aobId = aobIdMatch?.[1] || ''

    await api.post<{ succeeded: boolean; message: string }>(finalUrl, {
      aobId,
      remarks: payload?.remarks || '',
    })
    return {
      id: aobId,
      status: 'Returned',
      remarks: payload?.remarks,
    } as unknown as AOB
  },
}
