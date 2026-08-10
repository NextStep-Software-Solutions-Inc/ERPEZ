import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

export interface BaseTargetBulkUpdateItem {
  fyActiveKPIId: string
  agencyTargetAnnual: number
  agencyTargetQ1?: number | null
  agencyTargetQ2?: number | null
  agencyTargetQ3?: number | null
  agencyTargetQ4?: number | null
}

export type BulkUpdateBaseTargetsPayload = BaseTargetBulkUpdateItem[]

const endpoint = '/fy-active-kpis/targets/bulk'

export const bulkUpdateBaseTargetsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  undefined,
  BulkUpdateBaseTargetsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<boolean>>(
      finalUrl,
      payload
    )
    return response.data
  },
}
