/**
 * getAPPAnalyticsRequest
 * Fetches breakdown analytics for a single APP.
 *
 * Endpoint: GET /apps/{id}/analytics
 *
 * Returns: top-level metrics, breakdowns by office, category, fund source, procurement type,
 *          and financial (PS/MOOE/CO) breakdown.
 */

import type { QueryBlueprintFromTemplate, APIResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/apps/:id/analytics' as const

interface GetAPPAnalyticsParams extends QueryParams {
  id: string
}

// ── Response shapes matching backend C# APPAnalyticsResponse DTO ─────────────

export interface OfficeBreakdownItem {
  officeId: string
  officeName: string
  itemsCount: number
  totalAmount: number
}

export interface CategoryBreakdownItem {
  categoryName: string
  itemsCount: number
  totalAmount: number
}

export interface ProcurementTypeBreakdownItem {
  procurementModeName: string
  itemsCount: number
  totalAmount: number
}

export interface FundSourceBreakdownItem {
  fundSourceName: string
  itemsCount: number
  totalAmount: number
}

export interface APPFinancialBreakdown {
  ps: number
  mooe: number
  co: number
}

export interface APPAnalyticsResponse {
  appId: string
  appNumber: string
  name: string
  fiscalYear: string
  appType: string
  totalEstimatedBudget: number
  totalItemsCount: number
  totalPpmpsCount: number
  totalOfficesCount: number
  breakdownByOffice: OfficeBreakdownItem[]
  breakdownByCategory: CategoryBreakdownItem[]
  breakdownByProcurementType: ProcurementTypeBreakdownItem[]
  breakdownByFundSource: FundSourceBreakdownItem[]
  financialBreakdown: APPFinancialBreakdown
}

export const getAPPAnalyticsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<APPAnalyticsResponse>,
  GetAPPAnalyticsParams,
  readonly unknown[]
> = {
  endpoint,
  key: ({ url, id }) => [url, id] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<APPAnalyticsResponse>>(finalUrl, { signal })
    return response.data
  },
}
