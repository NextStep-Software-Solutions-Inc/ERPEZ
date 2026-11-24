/**
 * Unlink RFQ from AOB Request Handler
 * Unlinks an RFQ and removes its items from the AOB bid evaluation matrix
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/aobs/:id/rfqs/:rfqId' as const

export const unlinkRFQRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  { succeeded: boolean; message: string },
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<{ succeeded: boolean; message: string }>(finalUrl)
    return response.data
  },
}
