/**
 * Handler: Submit a PPMP for approval (Draft → Pending Review)
 * The first approval stage is Budget Officer.
 */

import {
  mockPpmpDatabase,
  mockPpmpListDatabase,
  mockLineItemBudgets,
} from '../data/mockPpmpData'
import type { PPMP } from '../types'
import { PPMPState, ApprovalRole } from '../types'
import {
  hasAnyOverBudgetBlock,
  assertPpmpWritable,
  computeRemainingLibBudget,
} from '../lib/ppmpUtils'

export const submitPpmpRequest = {
  endpoint: '/ppmps/:id/submit',
  key: null,
  fetcher: async (params: { data: { ppmpId: string; currentPpmp?: PPMP } }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 500))

    const ppmp = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!ppmp) throw new Error('PPMP not found.')
    assertPpmpWritable(ppmp)
    if (ppmp.state !== PPMPState.DRAFT && ppmp.state !== PPMPState.REJECTED) {
      throw new Error('Only Draft or Rejected PPMPs can be submitted for review.')
    }

    // Sync in-memory activityBlocks (which carry MSF links and other user edits)
    // back into the mock database record before the state transition.
    if (params.data.currentPpmp) {
      ppmp.activityBlocks = params.data.currentPpmp.activityBlocks
      ppmp.totalBudget = params.data.currentPpmp.totalBudget
    }

    if (ppmp.activityBlocks.length === 0 || ppmp.activityBlocks.every((a) => a.ioEBlocks.every((b) => b.items.length === 0))) {
      throw new Error('PPMP must have at least one item before submitting.')
    }
    if (hasAnyOverBudgetBlock(ppmp.activityBlocks)) {
      throw new Error('All IoE containers must be within their budget limits before submitting.')
    }
    const selectedLib = mockLineItemBudgets.find((lib) => lib.id === ppmp.libId)
    if (!selectedLib) {
      throw new Error('Selected LIB not found.')
    }
    const remainingBudget = computeRemainingLibBudget(
      selectedLib.totalAllocation,
      mockPpmpDatabase,
      ppmp.libId,
      ppmp.fiscalYear,
      ppmp.id,
    )
    if (ppmp.totalBudget > remainingBudget) {
      throw new Error('PPMP total cost exceeds the remaining LIB balance.')
    }

    ppmp.state = PPMPState.PENDING_REVIEW
    ppmp.currentApprovalStage = ApprovalRole.BUDGET_OFFICER
    ppmp.rejectionReason = null
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
