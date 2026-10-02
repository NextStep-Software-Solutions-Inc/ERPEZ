/**
 * Purchase Request API Contract Types
 * These match the backend Swagger spec exactly.
 * Keep separate from frontend display types in ./index.ts
 */

// ─── Shared ────────────────────────────────────────────────────────────────────

/** StatusEnum from ERPEZ.Domain.Enums */
export type PRStatusApi =
  | 'Draft'
  | 'Submitted'
  | 'Returned'
  | 'Approved'
  | 'Active'
  | 'Archived'
  | 'Completed'
  | 'Failed'
  | 'Pending'

/** PR type as expected by the API (PascalCase) */
export type PRTypeApi = 'NonCSE' | 'OutOfStockCSE'

export interface MonthlyQuantitiesApi {
  January?: number
  February?: number
  March?: number
  April?: number
  May?: number
  June?: number
  July?: number
  August?: number
  September?: number
  October?: number
  November?: number
  December?: number
}

// ─── Mappers ───────────────────────────────────────────────────────────────────

/**
 * Maps frontend lowercase status to backend PascalCase StatusEnum.
 * 'for-bac-utilization' has no direct backend status – treated as Approved.
 */
export function toApiStatus(frontendStatus: string): PRStatusApi {
  const map: Record<string, PRStatusApi> = {
    draft: 'Draft',
    submitted: 'Submitted',
    returned: 'Returned',
    approved: 'Approved',
    'for-bac-utilization': 'Approved',
  }
  return map[frontendStatus] ?? 'Draft'
}

/** Maps backend PascalCase StatusEnum to frontend lowercase status. */
export function fromApiStatus(
  apiStatus: string,
): 'draft' | 'submitted' | 'returned' | 'approved' | 'for-bac-utilization' {
  const map: Record<
    string,
    'draft' | 'submitted' | 'returned' | 'approved' | 'for-bac-utilization'
  > = {
    Draft: 'draft',
    Submitted: 'submitted',
    Returned: 'returned',
    Approved: 'approved',
    Active: 'approved',
  }
  return map[apiStatus] ?? 'draft'
}

/** Maps frontend PR type to API PR type. */
export function toApiPrType(frontendType: string): PRTypeApi {
  return frontendType === 'out-of-stock' ? 'OutOfStockCSE' : 'NonCSE'
}

/** Maps API PR type back to frontend type. */
export function fromApiPrType(
  apiType: string,
): 'non-cse' | 'out-of-stock' | 'consolidated' {
  if (apiType === 'OutOfStockCSE') return 'out-of-stock'
  return 'non-cse'
}

// ─── GET /purchase-requests ────────────────────────────────────────────────────

export interface PurchaseRequestListItem {
  id: string
  prNumber: string
  description: string
  prType: string
  officeId: string
  officeName: string
  status: string
  totalAmount: number
  requestedDate: string
  createdDate: string
  returnRemarks?: string
  returnedDate?: string
  returnedBy?: string
}

// ─── GET /purchase-requests/{id} ──────────────────────────────────────────────

export interface PurchaseRequestDetailItemApi {
  id: string
  /** Source PPMP item ID — optional/null for custom/ad-hoc items */
  ppmpItemId?: string | null
  /** Source APR item ID — only set for Out-of-Stock CSE items */
  aprItemId?: string
  aprId?: string
  aprNumber?: string
  aprOfficeName?: string
  name: string
  description: string
  stockNo: string
  isNonCSE: boolean
  unitCost: number
  requestedQuantity: number
  amount: number
  requestedMonth: string
  category: string
  fund: string
  ppmpId?: string
  ppmpNumber?: string
  unit?: string
  officeName?: string
  procurementModeId?: string
  procurementModeName?: string
}

export interface PRBacResolutionApi {
  id: string
  procurementProjectId: string
  projectTitle: string
  resolutionNumber: string
  resolutionType: string
  dateResolved: string
  status: string
  resolvedLocation?: string
  abc: number
  sourceType: string
}

export interface PurchaseRequestDetailApi {
  id: string
  prNumber: string
  description: string
  purpose: string
  prType: string
  status: string
  requestedDate: string
  totalAmount: number
  officeId: string
  officeName: string
  uacsCode: string
  /** BE field name is fundSource (maps from FundSource.Name) */
  fundSource: string
  procurementCategory: string
  returnRemarks?: string
  returnedDate?: string
  returnedBy?: string
  items: PurchaseRequestDetailItemApi[]
  bacResolutions?: PRBacResolutionApi[]
}

// ─── POST /purchase-requests ───────────────────────────────────────────────────

export interface CreatePurchaseRequestPayload {
  requestedDate: string
  prNumber: string
  procurementCategoryId: string
  description: string
  purpose: string
  officeId: string
  /** Optional – required for Non-CSE PRs that originate from a specific PPMP */
  ppmpId?: string
  /** TODO: add fund cluster selector to CreatePRModal UI */
  fundClusterId?: string
  /** TODO: add UACS code combination selector to CreatePRModal UI */
  uacsCodeCombinationId?: string
  prType: PRTypeApi
  items?: CreatePurchaseRequestItemPayload[]
}

export interface CreatePurchaseRequestItemPayload {
  ppmpItemId?: string
  aprItemId?: string
  name: string
  description: string
  unitCost: number
  requestedQuantity: number
  stockNo?: string
  isNonCSE: boolean
  requestedMonth: string
}

// ─── PUT /purchase-requests/{id} ──────────────────────────────────────────────

export interface UpdatePurchaseRequestItemPayload {
  ppmpItemId?: string
  aprItemId?: string
  name: string
  description: string
  unitCost: number
  requestedQuantity: number
  stockNo: string
  isNonCSE: boolean
  requestedMonth: string
}

export interface UpdatePurchaseRequestPayload {
  prNumber?: string
  description: string
  purpose: string
  fundClusterId?: string
  uacsCodeCombinationId?: string
  procurementCategoryId?: string
  requestedDate: string
  items?: UpdatePurchaseRequestItemPayload[]
}

// ─── GET /purchase-requests/stats ─────────────────────────────────────────────

export interface PurchaseRequestStats {
  totalPPMPAmount: number
  totalSubmittedPRAmount: number
  availableBalance: number
  draftCount: number
  submittedCount: number
  approvedCount: number
}

// ─── PATCH /purchase-requests/{id}/status ─────────────────────────────────────

export interface UpdatePurchaseRequestStatusPayload {
  prId: string
  newStatus: PRStatusApi
  remarks?: string
  actorName?: string
}

// ─── GET /purchase-requests/{id}/eligible-ppmps ───────────────────────────────

export interface EligiblePpmpItemMonthAllocation {
  month: string
  totalAllocated: number
  availableQuantity: number
  totalAvailableAmount: number
}

export interface EligiblePpmpItem {
  ppmpItemId: string
  itemName: string
  description?: string
  category: string
  itemCategory?: string
  uacsCode?: string
  fund: string
  unit: string
  unitPrice: number
  hasMonthlyAllocations?: boolean
  plannedQuantity?: number
  availableQuantity?: number
  monthlyAllocations: EligiblePpmpItemMonthAllocation[]
  totalAvailableAmount: number
  procurementModeId?: string
  procurementModeName?: string
}

export interface EligiblePpmpDocument {
  ppmpId: string
  ppmpNumber: string
  officeId: string
  officeName: string
  totalAmount: number
  items: EligiblePpmpItem[]
}
