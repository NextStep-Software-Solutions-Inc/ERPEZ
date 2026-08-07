/**
 * Handler: Update procurement metadata for a single PPMP line item.
 */

import { mockPpmpDatabase } from '../data/mockPpmpData'
import type { PPMP, UpdateLineItemMetadataPayload } from '../types'
import { assertPpmpWritable } from '../lib/ppmpUtils'

export const updateLineItemMetadataRequest = {
  endpoint: '/ppmps/:ppmpId/items/:itemId/metadata',
  key: null,
  fetcher: async (params: {
    data: UpdateLineItemMetadataPayload
  }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 200))

    const ppmp = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)

    for (const actBlock of ppmp.activityBlocks) {
      for (const ioEBlock of actBlock.ioEBlocks) {
        const item = ioEBlock.items.find((i) => i.id === params.data.itemId)
        if (!item) continue

        if ('projectType' in params.data) {
          item.projectType = params.data.projectType ?? null
        }
        if ('sizeSpecification' in params.data) {
          item.sizeSpecification = params.data.sizeSpecification ?? ''
        }
        if ('preProcurementConference' in params.data) {
          item.preProcurementConference =
            params.data.preProcurementConference ?? null
        }
        if ('procurementStart' in params.data) {
          item.procurementStart = params.data.procurementStart ?? null
        }
        if ('procurementEnd' in params.data) {
          item.procurementEnd = params.data.procurementEnd ?? null
        }
        if ('expectedDelivery' in params.data) {
          item.expectedDelivery = params.data.expectedDelivery ?? null
        }
        if ('remarks' in params.data) {
          item.remarks = params.data.remarks ?? null
        }
        ppmp.updatedAt = new Date().toISOString()

        return { ...ppmp }
      }
    }

    throw new Error(`Line item "${params.data.itemId}" not found.`)
  },
}