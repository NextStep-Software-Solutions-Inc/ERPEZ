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

    const isGuid = (val?: string | null) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

    const remarks = payload?.remarks || payload?.remarksBy
    // If approvedBy is a human-readable name rather than a GUID, append it to remarks for audit trail
    const auditRemarks =
      payload?.approvedBy && !isGuid(payload.approvedBy)
        ? `[Approved by ${payload.approvedBy}]${remarks ? ` ${remarks}` : ''}`
        : remarks

    await api.post<{ succeeded: boolean; message: string }>(finalUrl, {
      aobId,
      approvedBy: isGuid(payload?.approvedBy) ? payload?.approvedBy : null,
      signedDocumentUrl: payload?.signedDocumentUrl || null,
      remarks: auditRemarks || null,
    })
    return {
      id: aobId,
      status: 'Approved',
      approvedAt: new Date().toISOString(),
      signedDocumentUrl: payload?.signedDocumentUrl,
    } as unknown as AOB
  },
}
