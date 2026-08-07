import type {APIResponse, MutationBlueprintFromTemplate} from 'erpez-shared-lib';
import { api } from '@/services/api'

const endpoint = '/kpi-performance-measures/:id'

export const deleteKPIPerformanceMeasureRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const res = await api.delete<APIResponse<boolean>>(finalUrl)
    return res.data
  },
}
