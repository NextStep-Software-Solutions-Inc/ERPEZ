import type { QueryBlueprintFromTemplate, APIResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/apps' as const

interface GetAPPListParams extends QueryParams {
  pageNumber?: number
  pageSize?: number
  fiscalYearId?: string
  status?: string
  searchTerm?: string
}

/**
 * API Response type for APP data from backend.
 * Matches the APPResponse DTO returned by GET /apps.
 */
export interface AppListResponse {
  id: string
  appNumber: string
  name: string
  fiscalYearId: string
  fiscalYearName: string
  /** Indicative | Final | Updated */
  appType?: string
  /** e.g. Batch 1, Batch 2 */
  batch?: string
  /** e.g. Q1, Q2 */
  quarter?: string
  /** Version number for Updated APPs (1, 2, 3 …) */
  versionNumber?: number | null
  /** ISO date string for Updated APP version date */
  versionDate?: string | null
  /** Source APP id for Updated APPs */
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
  APPItems?: unknown[]
  APPPPMPs?: unknown[]
}

/**
 * Fetches the list of Annual Procurement Plans (APPs)
 *
 * Query Blueprint for retrieving all APPs with pagination and filtering
 * Used in: APPConsolidationPage to display live data from the API
 */
export const getAPPListRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<AppListResponse[]>, // Response type
  GetAPPListParams,               // Query parameters
  readonly unknown[]              // Cache key type (simplified)
> = {
  endpoint,
  key: ({ url, pageNumber = 1, pageSize = 10, fiscalYearId, status, searchTerm }) =>
    [url, pageNumber, pageSize, fiscalYearId || '', status || '', searchTerm || ''] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<AppListResponse[]>>(finalUrl, { signal })
    return response.data
  },
}
