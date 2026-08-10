/**
 * createSubKpiRequest Handler
 * Creates a new SubKPI under a parent KPI
 * Follows Request Blueprint Pattern from erpez-shared-lib
 */
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { SubKPI } from '../types'
import api from '@/services/api'

/** API endpoint for creating SubKPIs */
const endpoint = '/kpis/:kpiId/sub-kpi'

/** Payload type for creating a SubKPI */
export type CreateSubKPIPayload = {
  name: string
  description?: string
  SDGs: Array<string>
  kpiRatings: Array<{
    performanceMeasureId: string
    ratings?: Array<{
      value?: number
      remarks?: string
    }>
  }>
  kpiTargets: Array<{
    period: string
    value: number
    quarterName: string
  }>
  kpiMovs: Array<{
    name: string
    description: string
    file: string
  }>
}

/**
 * Mutation blueprint for creating a SubKPI
 * Uses parent KPI ID in the path to associate the SubKPI
 */
export const createSubKpiRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<SubKPI>,
  undefined,
  CreateSubKPIPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<SubKPI>>(finalUrl, payload)
    return response.data
  },
}
