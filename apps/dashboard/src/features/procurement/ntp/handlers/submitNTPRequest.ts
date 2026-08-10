/**
 * Submit NTP Request Handler
 * Submits drafted NTP for approval
 * Changes status from Draft to For Approval
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { NTP, SubmitNTPPayload } from '../types/ntpTypes'
import api from '@/services/api'

const endpoint = '/procurement/notice-to-proceed-ntp/:ntpId/submit'

export const submitNTPRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  NTP,
  undefined,
  SubmitNTPPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<{ data: NTP }>(finalUrl, {
      submittedAt: payload!.submittedAt,
      submittedBy: payload!.submittedBy,
    })
    return response.data.data
  },
}
