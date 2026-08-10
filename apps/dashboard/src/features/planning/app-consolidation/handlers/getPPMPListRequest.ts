import type { QueryBlueprintFromTemplate, APIResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/ppmps' as const

interface GetPPMPListParams extends QueryParams {
  pageNumber?: number
  pageSize?: number
  fiscalYearId?: string
  officeId?: string
  status?: string
  searchTerm?: string
}

/**
 * PPMP Item from API response
 * Represents a line item within a PPMP
 */
export interface PPMPItemFromAPI {
  id: string
  code: string
  description: string
  unit: string
  quantity: number
  unitCost: number
  totalAmount: number
  modeOfProcurement?: string
  fundSource?: string
  itemCategory?: string
  office?: string
  allotmentClass?: 'CO' | 'MOOE'
  [key: string]: any
}

/**
 * PPMP Data structure from API
 * Represents a complete PPMP document
 */
export interface PPMPListResponse {
  id: string
  ppmpNumber: string
  officeId: string
  officeName: string
  fiscalYearId: string
  fiscalYearName: string
  fundSourceId: string
  fundSourceName: string
  libId: string
  libName: string
  parentId: string | null
  version: number
  totalEstimatedBudget: number
  status: string
  submittedDate: string | null
  approvedDate: string | null
  consolidatedIntoId: string | null
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
  ParentPPMP: unknown | null
  PPMPItems: PPMPItemFromAPI[]
  PPMPItemAllocations: unknown[]
  PPMPActivities: unknown[]
  ApprovalEvents: unknown[]
  ChildPPMPs: unknown[]
}

/**
 * Fetches the list of PPMPs (Program Performance Management Plans)
 *
 * Query Blueprint for retrieving all PPMPs with pagination and filtering
 * Used in: SelectPPMPDialog to display available PPMPs for selection
 */
export const getPPMPListRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PPMPListResponse[]>,
  GetPPMPListParams,
  readonly unknown[]
> = {
  endpoint,
  key: ({ url, pageNumber = 1, pageSize = 100, fiscalYearId, officeId, status, searchTerm }) =>
    [url, pageNumber, pageSize, fiscalYearId || '', officeId || '', status || '', searchTerm || ''] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<PPMPListResponse[]>>(finalUrl, { signal })
    return response.data
  },
}
