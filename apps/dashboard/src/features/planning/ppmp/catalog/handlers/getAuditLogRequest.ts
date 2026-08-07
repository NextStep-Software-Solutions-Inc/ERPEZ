/**
 * Handler: Get Audit Log for a catalog item
 */

import { generateAuditLog } from '../utils/catalogMockData'
import type { AuditLogEntry } from '../types'

type HandlerParams = {
  finalUrl: string
  itemId: string
}

export const getAuditLogRequest = {
  endpoint: '/catalog/master/items/:id/audit-log',
  key: ({ itemId }: { itemId: string }) =>
    ['catalog-audit-log', itemId] as const,
  fetcher: async ({ itemId }: HandlerParams): Promise<AuditLogEntry[]> => {
    await new Promise((r) => setTimeout(r, 200))
    return generateAuditLog(itemId)
  },
}
