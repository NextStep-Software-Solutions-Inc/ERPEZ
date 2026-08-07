/**
 * Update FY Active KPI Request Handler
 * PUT /fy-active-kpis/{id}
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

export interface UpdateFYActiveKpiPayload {
  mfopapId?: string
  name: string
  code: string
  description?: string
  measurementUnit?: string
  distributionBehavior?: string
  functionCategory?: string
  monitoringFrequency?: string
  isOptInAvailable?: boolean
  isGAD?: boolean
  status?: string
  SDGIds?: string[]
  AttributeIds?: string[]
}

const endpoint = '/fy-active-kpis/:kpiId'

export const updateFYActiveKpiRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  any,
  undefined,
  UpdateFYActiveKpiPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<any>(finalUrl, payload)
    return response.data
  },
}
