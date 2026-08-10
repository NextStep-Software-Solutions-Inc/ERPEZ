/**
 * Handler: Override the Mode of Procurement for a line item (with justification)
 */

import { mockPpmpDatabase } from '../data/mockPpmpData'
import type { PPMP, ModeOfProcurement } from '../types'
import { assertPpmpWritable } from '../lib/ppmpUtils'

interface UpdateMoPData {
  ppmpId: string
  itemId: string
  mopOverride: ModeOfProcurement
  mopJustification: string
}

export const updateLineItemMoPRequest = {
  endpoint: '/ppmps/:ppmpId/items/:itemId/mop',
  key: null,
  fetcher: async (params: { data: UpdateMoPData }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 200))

    const ppmp = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)

    for (const actBlock of ppmp.activityBlocks) {
      for (const ioEBlock of actBlock.ioEBlocks) {
        const item = ioEBlock.items.find((i) => i.id === params.data.itemId)
        if (!item) continue

        item.mopOverride = params.data.mopOverride
        item.mopJustification = params.data.mopJustification
        ppmp.updatedAt = new Date().toISOString()

        return { ...ppmp }
      }
    }

    throw new Error(`Line item "${params.data.itemId}" not found.`)
  },
}
