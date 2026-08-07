/**
 * Handler: Toggle PPMP finalization status
 * Updates the isFinal flag and records finalized timestamp/user
 */

import { mockPpmpDatabase } from '../data/mockPpmpData'
import type { PPMP } from '../types'
import { assertPpmpWritable } from '../lib/ppmpUtils'

interface TogglePpmpFinalizationData {
  ppmpId: string
  isFinal: boolean
  userId?: string
}

export const togglePpmpFinalizationRequest = {
  endpoint: '/ppmps/:ppmpId/toggle-final',
  key: null,
  fetcher: async (params: {
    data: TogglePpmpFinalizationData
  }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 300))

    const ppmp = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)

    // Create immutable update to avoid shared state mutations
    const index = mockPpmpDatabase.findIndex((p) => p.id === params.data.ppmpId)
    if (index < 0) throw new Error('PPMP not found.')

    const updated = {
      ...mockPpmpDatabase[index],
      isFinal: params.data.isFinal,
      finalizedAt: params.data.isFinal ? new Date().toISOString() : null,
      finalizedBy: params.data.isFinal ? (params.data.userId || 'current-user') : null,
      updatedAt: new Date().toISOString(),
    }
    mockPpmpDatabase[index] = updated
    return updated
  },
}
