import type {APIResponse, MutationBlueprintFromTemplate} from 'erpez-shared-lib';
import type { KPIPerformanceMeasure } from '../../kpi-performance-measure/types'
import { api } from '@/services/api'

const endpoint = '/kpi-performance-measures'

type CreateKPIPerformanceMeasurePayload = {
  kpiId: string
  performanceMeasureId: string
}

export const createKPIPerformanceMeasureRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KPIPerformanceMeasure>,
  {},
  CreateKPIPerformanceMeasurePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const res = await api.post<APIResponse<KPIPerformanceMeasure>>(finalUrl, payload)
    return res.data
  },
}