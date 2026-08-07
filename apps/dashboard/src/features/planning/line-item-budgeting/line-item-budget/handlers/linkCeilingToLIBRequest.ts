import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/libs/:id/link-ceiling'

export type LinkCeilingToLIBPayload = {
  agencyMasterBudgetId: string
}

export const linkCeilingToLIBRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  LinkCeilingToLIBPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<boolean>>(finalUrl, payload)
    return response.data
  },
}
