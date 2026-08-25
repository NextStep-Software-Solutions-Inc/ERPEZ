/**
 * Delete AOB Request Handler
 * Soft-deletes an AOB (allowed for unapproved AOBs)
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/aobs/:id' as const

export const deleteAOBRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  void,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    await api.delete(finalUrl)
  },
}
