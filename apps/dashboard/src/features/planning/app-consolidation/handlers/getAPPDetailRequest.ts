import type { QueryBlueprintFromTemplate, APIResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/apps/:appId' as const

interface GetAPPDetailParams extends QueryParams {
  appId: string
}

/**
 * API Response type for APP detail data from backend
 * Maps to the actual API response structure from GET /apps/{appId}
 */
export interface APPItemFromAPI {
  id: string
  ppmpItemId?: string | null
  ppmpItemName?: string | null
  procurementModeId?: string | null
  procurementModeName?: string | null
  fundSourceId?: string | null
  fundSourceName?: string | null
  officeId?: string | null
  officeName?: string | null
  papCode?: string | null
  remarks?: string | null
  epaRemarks?: string | null
  isEarlyProcurementActivity?: boolean
  isOutsourced?: boolean
  startOfProcurementOverride?: string | null
  endOfProcurementOverride?: string | null
  estimatedBudgetOverride?: number | null
  originalPPMPBudget?: number | null
  effectiveABC?: number | null
  effectiveStartOfProcurement?: string | null
  effectiveEndOfProcurement?: string | null
  isABCOverridden?: boolean
  isStartProcurementOverridden?: boolean
  isEndProcurementOverridden?: boolean
  bidEvaluationCriteria?: string | null
  procurementStrategies?: string[]
  isNew?: boolean
  isRevised?: boolean
  schedules?: any[]
  code?: string | null
  description?: string | null
  unit?: string | null
  quantity?: number | null
  unitCost?: number | null
  totalAmount?: number | null
  modeOfProcurement?: string | null
  fundSource?: string | null
  itemCategory?: string | null
  office?: string | null
  allotmentClass?: string | null
}

export interface APPPPMPItemFromAPI {
  id: string
  code?: string | null
  description: string
  unit: string
  quantity: number
  unitCost: number
  totalAmount: number
  modeOfProcurement: string
  itemCategory: string
  allotmentClass?: string | null
}

export interface APPPPMPFromAPI {
  id: string
  ppmpNumber: string
  documentName: string
  fiscalYearId: string
  officeId: string
  officeName: string
  fundSourceId: string
  fundSourceName: string
  status: string
  PPMPItems?: APPPPMPItemFromAPI[]
  totalEstimatedBudget?: number
  version?: number
  isFinal?: boolean
  description?: string | null
}

export interface APPPPMPRelationFromAPI {
  id: string
  appId: string
  ppmpId: string
  PPMP?: APPPPMPFromAPI
  ppmpNumber?: string
  documentName?: string
  status?: string
  officeName?: string
  fundSourceName?: string
  PPMPItems?: APPPPMPItemFromAPI[]
}

export interface AppDetailResponse {
  id: string
  appNumber: string
  name: string
  fiscalYearId: string
  fiscalYearName: string
  /** Indicative | Final | Updated */
  appType?: string
  /** e.g. Batch 1 */
  batch?: string
  /** e.g. Q1 */
  quarter?: string
  /** Version number for Updated APPs */
  versionNumber?: number | null
  /** Version date for Updated APPs (ISO string) */
  versionDate?: string | null
  /** Source APP ID for Updated APPs */
  sourceAppId?: string | null
  isFinal?: boolean | string
  remarks?: string
  description?: string
  status: string
  submittedDate?: string | null
  approvedDate?: string | null
  createdAt: string
  createdBy?: string
  updatedAt?: string | null
  updatedBy?: string | null
  FiscalYear?: {
    id: string
    year: number
    status: string
    startDate?: string | null
    endDate?: string | null
  }
  APPItems?: APPItemFromAPI[]
  APPPPMPs?: APPPPMPRelationFromAPI[]
}

/**
 * Fetches the details of a specific Annual Procurement Plan (APP)
 *
 * Query Blueprint for retrieving a single APP with all its details
 * Used in: APPDetailsPage to display live data from the API
 */
export const getAPPDetailRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<AppDetailResponse>,
  GetAPPDetailParams,
  readonly unknown[]
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<AppDetailResponse>>(finalUrl, { signal })
    return response.data
  },
}
