/**
 * Approve NTP Request Handler
 * Approves an NTP and uploads signed document
 * Changes status from For Approval to Approved
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { NTP, ApproveNTPPayload } from '../types/ntpTypes'
import api from '@/services/api'

const endpoint = '/procurement/notice-to-proceed-ntp/:ntpId/approve'

export const approveNTPRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  NTP,
  undefined,
  ApproveNTPPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    // Create form data with file and metadata
    const formData = new FormData()
    if (payload!.signedDocument) {
      formData.append('signedDocument', payload!.signedDocument)
    }
    formData.append('approvedBy', payload!.approvedBy)
    if (payload!.approvalRemarks) {
      formData.append('approvalRemarks', payload!.approvalRemarks)
    }
    if (payload!.approvedAt) {
      formData.append('approvedAt', payload!.approvedAt)
    }

    const response = await api.post<{ data: NTP }>(finalUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },
}
