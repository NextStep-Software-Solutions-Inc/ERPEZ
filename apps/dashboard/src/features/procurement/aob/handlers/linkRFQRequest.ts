/**
 * Link RFQ to AOB Request Handler
 * Links RFQs to an AOB for consolidated bid canvassing
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AOB, LinkRFQPayload } from '../types/aobTypes'
import api from '@/services/api'

const endpoint = '/aobs/:id/link-rfqs' as const

export const linkRFQRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AOB,
  undefined,
  Omit<LinkRFQPayload, 'aobId'>
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const aobIdMatch = finalUrl.match(/\/aobs\/([^\/]+)\/link-rfqs/)
    const aobId = aobIdMatch?.[1] || ''
    const rfqIds = payload?.rfqIds || (payload?.rfqId ? [payload.rfqId] : [])

    await api.post<{ succeeded: boolean; message: string }>(finalUrl, {
      aobId,
      rfqIds,
    })

    return {
      id: aobId,
      rfqIds,
    } as unknown as AOB
  },
}
