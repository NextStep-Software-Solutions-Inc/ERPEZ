/**
 * Handler: Reject a PPMP (returns it to Draft state for editing)
 */

import { mockPpmpDatabase, mockPpmpListDatabase } from '../data/mockPpmpData'
import type { PPMP, ApprovalEvent } from '../types'
import { PPMPState } from '../types'

interface RejectPpmpData {
  ppmpId: string
  role: import('../types').ApprovalRole
  actorId: string
  actorName: string
  rejectionReason: string
}

export const rejectPpmpRequest = {
  endpoint: '/ppmps/:id/reject',
  key: null,
  fetcher: async (params: { data: RejectPpmpData }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 500))

    const ppmp = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    if (ppmp.state !== PPMPState.PENDING_REVIEW) {
      throw new Error('Only PPMPs in Pending Review state can be rejected.')
    }
    if (!params.data.rejectionReason.trim()) {
      throw new Error('A rejection reason is required.')
    }

    const event: ApprovalEvent = {
      id: `event-${Date.now()}`,
      ppmpId: ppmp.id,
      role: params.data.role,
      action: 'rejected',
      actorId: params.data.actorId,
      actorName: params.data.actorName,
      notes: params.data.rejectionReason,
      timestamp: new Date().toISOString(),
    }
    ppmp.approvalHistory.push(event)
    ppmp.state = PPMPState.REJECTED
    ppmp.currentApprovalStage = null
    ppmp.rejectionReason = params.data.rejectionReason
    ppmp.updatedAt = new Date().toISOString()

    const listItem = mockPpmpListDatabase.find((p) => p.id === ppmp.id)
    if (listItem) {
      listItem.state = ppmp.state
      listItem.currentApprovalStage = null
      listItem.updatedAt = ppmp.updatedAt
    }

    return { ...ppmp }
  },
}
