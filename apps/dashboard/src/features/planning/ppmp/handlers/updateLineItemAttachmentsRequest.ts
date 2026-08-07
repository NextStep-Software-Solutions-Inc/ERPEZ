/**
 * Handler: Update supporting documents for a single PPMP line item.
 * FE-only mock persistence for the attachment UI.
 */

import { mockPpmpDatabase } from '../data/mockPpmpData'
import type { PPMP, PPMPAttachment } from '../types'
import { assertPpmpWritable } from '../lib/ppmpUtils'

interface UpdateLineItemAttachmentsData {
  ppmpId: string
  itemId: string
  attachments: PPMPAttachment[]
}

export const updateLineItemAttachmentsRequest = {
  endpoint: '/ppmps/:ppmpId/items/:itemId/attachments',
  key: null,
  fetcher: async (params: {
    data: UpdateLineItemAttachmentsData
  }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 200))

    const ppmp = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)

    for (const actBlock of ppmp.activityBlocks) {
      for (const ioEBlock of actBlock.ioEBlocks) {
        const item = ioEBlock.items.find((i) => i.id === params.data.itemId)
        if (!item) continue

        item.attachments = params.data.attachments
        ppmp.updatedAt = new Date().toISOString()

        return { ...ppmp }
      }
    }

    throw new Error(`Line item "${params.data.itemId}" not found.`)
  },
}
