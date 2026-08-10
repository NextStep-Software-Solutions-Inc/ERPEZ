import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/budget-calls/bulk'

export type BulkDeleteBudgetCallsPayload = {
  ids: string[]
}

export type BulkDeleteResult = {
  deletedIds: string[]
}

export const bulkDeleteBudgetCallsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<BulkDeleteResult>,
  undefined,
  BulkDeleteBudgetCallsPayload
> = {
  endpoint,
  fetcher: async ({ payload }) => {
    if (!payload || !Array.isArray(payload.ids)) {
      throw new Error('Invalid payload for bulk delete')
    }

    const deletedIds: string[] = []

    // Sequential deletes — stop on first error (per spec)
    for (const id of payload.ids) {
      const res = await api.delete<APIResponse<boolean>>(
        `/budget-calls/${id}`,
      )
      if (!res.data || res.data.data !== true) {
        // bubble an informative error
        throw new Error(`Failed to delete budget call id=${id}`)
      }
      deletedIds.push(id)
    }

    return {
      data: {
        deletedIds,
      },
    }
  },
}
