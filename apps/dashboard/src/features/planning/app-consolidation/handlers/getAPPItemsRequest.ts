import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/app-items'

/**
 * API Response type for APP Item schedule reference
 */
export interface APPItemScheduleReferenceResponse {
  id: string
  procurementActivityTypeId: string
  procurementActivityTypeName: string
  scheduledDate?: string | null
  customDateText?: string | null
}

/**
 * API Response type for APP Item APP details
 */
export interface APPItemAPPResponse {
  id: string
  appNumber: string
  name: string
  status: string
}

/**
 * API Response type for APP Item PPMP Item details
 */
export interface APPItemPPMPItemResponse {
  id: string
  papCode?: string | null
  name: string
  description?: string | null
  unit: string
  unitPrice: number
}

/**
 * API Response type for APP Item Procurement Mode details
 */
export interface APPItemProcurementModeResponse {
  id: string
  name: string
  description?: string | null
}

/**
 * API Response type for APP Item Fund Source details
 */
export interface APPItemFundSourceResponse {
  id: string
  name: string
  code: string
}

/**
 * API Response type for APP Item Office details
 */
export interface APPItemOfficeResponse {
  id: string
  name: string
  code: string
}

/**
 * API Response type for APP Item data from backend
 * Used for selection and display in forms and tables
 */
export interface APPItemResponse {
  id: string
  appId: string
  ppmpItemId: string
  PPMPItemName: string
  procurementModeId: string
  ProcurementModeName: string
  fundSourceId: string
  FundSourceName: string
  officeId: string
  OfficeName: string
  PAPCode?: string | null
  remarks?: string | null
  isEarlyProcurementActivity: boolean
  isOutsourced: boolean
  bidEvaluationCriteria?: 'LCRB' | 'MEARB' | 'MARB_HRRB_SRRB' | 'LCCRB' | null
  procurementStrategies?: Array<
    | 'LCA'
    | 'Subcontracting'
    | 'MultiYearContracting'
    | 'DesignAndBuild'
    | 'ProcurementAgent'
    | 'FrameworkAgreement'
    | 'PooledProcurement'
    | 'RenewalOfServices'
    | 'WarehousingInventory'
    | 'NotApplicable'
  > | null
  createdAt: string
  createdBy: string
  updatedAt?: string | null
  updatedBy?: string | null
  APP?: APPItemAPPResponse | null
  PPMPItem?: APPItemPPMPItemResponse | null
  ProcurementMode?: APPItemProcurementModeResponse | null
  FundSource?: APPItemFundSourceResponse | null
  Office?: APPItemOfficeResponse | null
  Schedules?: APPItemScheduleReferenceResponse[] | null
}

/**
 * Fetches the list of APP Items
 *
 * Query Blueprint for retrieving all APP Items with pagination and filtering
 * Used in: Procurement forms for selecting APP Items to reference in procurement projects
 */
export const getAPPItemsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<APPItemResponse>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<APPItemResponse>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
