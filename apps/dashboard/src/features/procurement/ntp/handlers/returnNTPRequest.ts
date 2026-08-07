/**
 * Return NTP Request Handler
 * Returns NTP to procuring unit with remarks
 * Changes status from For Approval to Returned/Draft
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { NTP, ReturnNTPPayload } from '../types/ntpTypes'
import api from '@/services/api'

const endpoint = '/procurement/notice-to-proceed-ntp/:ntpId/return'

export const returnNTPRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  NTP,
  undefined,
  ReturnNTPPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<{ data: NTP }>(finalUrl, {
      reason: payload!.reason,
      remarks: payload!.remarks,
      returnedBy: payload!.returnedBy,
      returnedAt: payload!.returnedAt,
    })
    return response.data.data
  },
}
