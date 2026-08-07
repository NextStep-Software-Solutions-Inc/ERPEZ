/**
 * Handler: Approve a PPMP at the current approval stage.
 * Advances to the next stage or marks as Approved if HoPE approves.
 */

import { mockPpmpDatabase, mockPpmpListDatabase } from '../data/mockPpmpData'
import type { PPMP, ApprovalEvent } from '../types'
import { PPMPState, ApprovalRole, APPROVAL_CHAIN } from '../types'

interface ApprovePpmpData {
  ppmpId: string
  role: ApprovalRole
  actorId: string
  actorName: string
  notes?: string
}

export const approvePpmpRequest = {
  endpoint: '/ppmps/:id/approve',
  key: null,
  fetcher: async (params: { data: ApprovePpmpData }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 500))

    const ppmp = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    if (ppmp.state !== PPMPState.PENDING_REVIEW) {
      throw new Error('Only PPMPs in Pending Review state can be approved.')
    }
    if (ppmp.currentApprovalStage !== params.data.role) {
      throw new Error(`This PPMP is awaiting approval by: ${ppmp.currentApprovalStage}`)
    }

    const event: ApprovalEvent = {
      id: `event-${Date.now()}`,
      ppmpId: ppmp.id,
      role: params.data.role,
      action: 'approved',
      actorId: params.data.actorId,
      actorName: params.data.actorName,
      notes: params.data.notes ?? null,
      timestamp: new Date().toISOString(),
    }
    ppmp.approvalHistory.push(event)

    const currentIdx = APPROVAL_CHAIN.indexOf(params.data.role)
    const nextRole = APPROVAL_CHAIN[currentIdx + 1]

    if (nextRole) {
      ppmp.currentApprovalStage = nextRole
    } else {
      // HoPE approved — final approval
      ppmp.state = PPMPState.APPROVED
      ppmp.currentApprovalStage = null
    }

    ppmp.updatedAt = new Date().toISOString()

    const listItem = mockPpmpListDatabase.find((p) => p.id === ppmp.id)
    if (listItem) {
      listItem.state = ppmp.state
      listItem.currentApprovalStage = ppmp.currentApprovalStage
      listItem.updatedAt = ppmp.updatedAt
    }

    return { ...ppmp }
  },
}
