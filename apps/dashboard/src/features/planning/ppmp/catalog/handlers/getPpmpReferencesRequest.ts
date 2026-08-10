/**
 * Handler: Get PPMP References for a catalog item
 */

import {
  generatePpmpReferences,
  getMockNonCseItems,
} from '../utils/catalogMockData'
import type { PpmpReference } from '../types'

type HandlerParams = {
  finalUrl: string
  itemId: string
}

export const getPpmpReferencesRequest = {
  endpoint: '/catalog/master/items/:id/ppmp-references',
  key: ({ itemId }: { itemId: string }) =>
    ['catalog-ppmp-refs', itemId] as const,
  fetcher: async ({ itemId }: HandlerParams): Promise<PpmpReference[]> => {
    await new Promise((r) => setTimeout(r, 200))
    const item = getMockNonCseItems().find((i) => i.id === itemId)
    const count = item?.referenceCount ?? 0
    return generatePpmpReferences(itemId, count)
  },
}
