/**
 * Handler: Create a mid-year Amendment from an Approved PPMP.
 * Creates v2 PPMP (Amending state) linked to v1 (stays Approved until v2 is approved).
 */

import {
  mockPpmpDatabase,
  mockPpmpListDatabase,
  mockAmendmentRecords,
} from '../data/mockPpmpData'
import type { PPMP, PPMPListItem, PPMPAmendmentRecord } from '../types'
import { PPMPState } from '../types'

interface CreateAmendmentData {
  ppmpId: string
  reason: string
}

export const createAmendmentRequest = {
  endpoint: '/ppmps/:id/amend',
  key: null,
  fetcher: async (params: { data: CreateAmendmentData }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 500))

    const original = mockPpmpDatabase.find((p) => p.id === params.data.ppmpId)
    if (!original) throw new Error('PPMP not found.')
    if (original.state !== PPMPState.APPROVED) {
      throw new Error('Only Approved PPMPs can be amended.')
    }
    if (!params.data.reason.trim()) {
      throw new Error('Amendment reason is required.')
    }

    // Deep-clone the original PPMP for the amendment
    const amendment: PPMP = {
      ...JSON.parse(JSON.stringify(original)),
      id: `ppmp-amend-${Date.now()}`,
      state: PPMPState.AMENDING,
      currentApprovalStage: null,
      parentPpmpId: original.id,
      amendmentVersion: original.amendmentVersion + 1,
      approvalHistory: [],
      rejectionReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockPpmpDatabase.push(amendment)

    const listItem: PPMPListItem = {
      id: amendment.id,
      documentName: `${amendment.documentName} (Amendment v${amendment.amendmentVersion})`,
      ppmpNumber: amendment.ppmpNumber,
      fiscalYear: amendment.fiscalYear,
      libName: amendment.libName,
      isMasterOffice: amendment.isMasterOffice,
      officeId: amendment.officeId,
      consolidatedToMasterId: amendment.consolidatedToMasterId,
      state: amendment.state,
      totalBudget: amendment.totalBudget,
      currentApprovalStage: amendment.currentApprovalStage,
      amendmentVersion: amendment.amendmentVersion,
      createdBy: amendment.createdBy,
      createdAt: amendment.createdAt,
      updatedAt: amendment.updatedAt,
    }
    mockPpmpListDatabase.push(listItem)

    const record: PPMPAmendmentRecord = {
      originalPpmpId: original.id,
      originalDocumentName: original.documentName,
      amendmentPpmpId: amendment.id,
      amendmentVersion: amendment.amendmentVersion,
      amendmentState: amendment.state,
      reason: params.data.reason,
      createdAt: amendment.createdAt,
      createdBy: amendment.createdBy,
    }
    mockAmendmentRecords.push(record)

    return { ...amendment }
  },
}
