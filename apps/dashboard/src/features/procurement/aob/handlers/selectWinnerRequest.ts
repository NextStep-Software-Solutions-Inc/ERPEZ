/**
 * Select Winner / Award AOB Request Handler
 * Awards line items to winning suppliers with justification
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { Winner, SelectWinnerPayload, AwardItemInputDto } from '../types/aobTypes'
import api from '@/services/api'

const endpoint = '/aobs/:id/award' as const

export const selectWinnerRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  Winner,
  undefined,
  Omit<SelectWinnerPayload, 'aobId'>
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const items: AwardItemInputDto[] = payload?.awardedItems || [
      {
        rfqItemId: payload?.rfqItemId || payload?.lineItemId || '',
        winningSupplierId: payload?.winningSupplierId || '',
        awardedUnitPrice: payload?.awardedUnitPrice || 0,
        awardedQuantity: payload?.awardedQuantity || 1,
        score: payload?.score || 100,
        awardReason: payload?.awardReason || 'Lowest calculated responsive quotation',
      },
    ]

    await api.post<{ succeeded: boolean; message: string }>(finalUrl, items)
    return {
      id: payload?.rfqItemId || payload?.lineItemId || '',
      lineItemId: payload?.lineItemId || payload?.rfqItemId || '',
      rfqItemId: payload?.rfqItemId || payload?.lineItemId || '',
      supplierId: payload?.winningSupplierId || '',
      winningSupplierId: payload?.winningSupplierId || '',
      supplierName: '',
      bidAmount: payload?.awardedUnitPrice || 0,
      awardReason: payload?.awardReason,
      selectionDate: new Date().toISOString(),
    } as Winner
  },
}
