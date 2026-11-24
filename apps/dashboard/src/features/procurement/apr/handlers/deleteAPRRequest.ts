/**
 * Delete APR Request Handler
 * Mutation blueprint for deleting a draft APR via DELETE /aprs/:aprId
 */

import type {
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/aprs/:aprId' as const

export interface DeleteAPRPayload {
  aprId: string
}

export const deleteAPRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  void,
  undefined,
  DeleteAPRPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    await api.delete(finalUrl)
  },
}
