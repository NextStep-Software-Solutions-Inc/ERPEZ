import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { ProcurementWorkflowSetting } from '@/components/features/planning/organizational-structure/types'
import type { APIResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/procurement-workflows/:id'

// NOTE: This handler returns a single ProcurementWorkflowSetting object as APIResponse<ProcurementWorkflowSetting>.
// All consumers (e.g., UpdateProcurementWorkflowDialog) must expect procurementWorkflowData to be an object, not an array.
export const getProcurementWorkflowRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementWorkflowSetting>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ProcurementWorkflowSetting>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
