/**
 * Approve AOB Request Handler
 * BAC Chairperson approves AOB with optional signed resolution PDF
 * Changes AOB status from ForApproval to Approved
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AOB, AOBApprovalPayload } from '../types/aobTypes'
import api from '@/services/api'

const endpoint = '/aobs/:id/approve' as const

export const approveAOBRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AOB,
  undefined,
  Omit<AOBApprovalPayload, 'aobId'>
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const aobIdMatch = finalUrl.match(/\/aobs\/([^\/]+)\/approve/)
    const aobId = aobIdMatch?.[1] || ''

    await api.post<{ succeeded: boolean; message: string }>(finalUrl, {
      aobId,
      approvedBy: payload?.approvedBy,
      signedDocumentUrl: payload?.signedDocumentUrl,
      remarks: payload?.remarks || payload?.remarksBy,
    })
    return {
      id: aobId,
      status: 'Approved',
      approvedAt: new Date().toISOString(),
      signedDocumentUrl: payload?.signedDocumentUrl,
    } as unknown as AOB
  },
}
