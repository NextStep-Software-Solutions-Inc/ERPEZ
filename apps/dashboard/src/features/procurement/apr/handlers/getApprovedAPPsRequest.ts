/**
 * Get Approved APPs Request Handler
 * 
 * Fetches list of approved Annual Procurement Plans (APPs) from backend GET /apps
 * Used to populate APP selection in CreateAPRDialog
 */

import type {
  QueryBlueprintFromTemplate,
  PaginationResponse,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'

export interface APPItemResponse {
  id: string
  ppmpItemId: string
  ppmpItemName: string
  description: string
  unit: string
  quantity: number
  unitCost: number
  totalAmount: number
  procurementModeId: string
  procurementModeName: string
  fundSourceId: string
  fundSourceName: string
  officeId: string
  officeName: string
  papCode: string
  remarks?: string
  isEarlyProcurementActivity: boolean
}

export interface APPFiscalYearDto {
  id: string
  year: number
  status: string
}

export interface BackendAPPResponse {
  id: string
  appNumber: string
  name: string
  fiscalYearId: string
  fiscalYearName: string
  appType: string
  status: string
  fiscalYear?: APPFiscalYearDto
  appItems: APPItemResponse[]
}

const endpoint = '/apps' as const

export interface GetApprovedAPPsParams extends QueryParams {
  Filters?: string
  Page?: number
  PageSize?: number
  fiscalYear?: number
}

export const getApprovedAPPsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<BackendAPPResponse>,
  GetApprovedAPPsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<BackendAPPResponse>>(finalUrl, { signal })
    return response.data
  },
}
