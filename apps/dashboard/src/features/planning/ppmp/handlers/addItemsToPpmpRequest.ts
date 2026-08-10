/**
 * Handler: Batch-add catalog items as line items inside an IoE block
 */

import {
  mockPpmpDatabase,
  mockCseCatalogItems,
  mockNonCseCatalogItems,
} from '../data/mockPpmpData'
import type { PPMP, PPMPLineItem } from '../types'
import { createEmptyMonthlyQuantities } from '../types'
import { getSuggestedMoP, assertPpmpWritable } from '../lib/ppmpUtils'

interface AddItemsData {
  ppmpId: string
  ioEBlockId: string
  catalogItemIds: string[]
}

export const addItemsToPpmpRequest = {
  endpoint: '/ppmps/:id/items',
  key: null,
  fetcher: async (params: { data: AddItemsData }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 400))

    const ppmp = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)

    const allCatalog = [...mockCseCatalogItems, ...mockNonCseCatalogItems]

    for (const actBlock of ppmp.activityBlocks) {
      const ioEBlock = actBlock.ioEBlocks.find((b) => b.id === params.data.ioEBlockId)
      if (!ioEBlock) continue

      for (const catalogId of params.data.catalogItemIds) {
        // Skip if item is already in this IoE block
        if (ioEBlock.items.some((i) => i.catalogItemId === catalogId)) continue

        const catalogItem = allCatalog.find((c) => c.id === catalogId)
        if (!catalogItem) continue

        const quantities = createEmptyMonthlyQuantities()
        const newItem: PPMPLineItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          catalogItemId: catalogItem.id,
          itemName: catalogItem.name,
          unitOfMeasure: catalogItem.unitOfMeasure,
          unitPrice: catalogItem.unitPrice,
          originDepartmentId: ppmp.isMasterOffice ? null : ppmp.officeId,
          originDepartmentName: ppmp.isMasterOffice
            ? null
            : (ppmp.officeId ?? 'department').toUpperCase(),
          monthlyQuantities: quantities,
          totalQuantity: 0,
          estimatedBudget: 0,
          suggestedMoP: getSuggestedMoP(catalogItem, 0),
          mopOverride: null,
          mopJustification: '',
          ioEBlockId: ioEBlock.id,
          sortOrder: ioEBlock.items.length + 1,
          marketScopingId: null,
          marketScopingRef: null,
          marketScopingCostEstimate: null,
          projectType: null,
          sizeSpecification: '',
          preProcurementConference: null,
          procurementStart: null,
          procurementEnd: null,
          expectedDelivery: null,
          remarks: '',
          attachments: [],
        }

        ioEBlock.items.push(newItem)
      }

      ppmp.updatedAt = new Date().toISOString()
      return { ...ppmp }
    }

    throw new Error('IoE block not found in this PPMP.')
  },
}
