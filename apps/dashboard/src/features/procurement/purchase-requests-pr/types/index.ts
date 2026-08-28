/**
 * Purchase Request (PR) Types & Interfaces
 * Supporting both Non-CSE and Out-of-Stock CSE workflows
 */

export type PRType = 'non-cse' | 'out-of-stock' | 'consolidated'
export type PRStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'returned'
  | 'for-bac-utilization'
export type PRTaskType =
  | 'non-cse'
  | 'out-of-stock'
  | 'manage-pr'
  | 'consolidate-pr'

export interface PRHeaderDetails {
  date: string
  prNumber: string
  description: string
  purpose: string
  officeId?: string
  officeName?: string
  procurementCategoryId?: string
  procurementCategoryName?: string
  torRequired?: boolean
  isHighlyTechnicalGoodsServices?: boolean
  uacs?: string
  fundCluster?: string
  // For out-of-stock PRs originating from APR/CNAS
  cnasReferenceNumber?: string
  sourceAPR?: string
  // Multi-source BAC Resolution references
  appItemId?: string
  bacResolutionId?: string
  bacResolutionNumber?: string
  modeOfProcurement?: string
  sourceType?: 'APP_ITEM' | 'CONSOLIDATED_PR'
}

export interface PRAttachment {
  name: string
  url: string
  mimeType?: string
  size?: number
  uploadedAt?: string
}

export interface PRItem {
  // Optional for compatibility with existing PR item creation flows that still only provide `unitPrice`
  estimatedUnitPrice?: number
  id: string
  itemId: string
  itemName: string
  category: string
  quantity: number
  unitOfMeasure: string
  unitPrice: number
  totalAmount: number
  description?: string
  stockNo?: string
  source?: 'ppmp' | 'apr' | 'bac' // Source of item
  ppmpDocId?: string // For non-CSE PRs, track which PPMP document this item came from
  ppmpDocName?: string // For non-CSE PRs, store the PPMP document name
  month?: string
  fund?: string
  aprId?: string
  aprNumber?: string
  aprOffice?: string
  aprTotalAmount?: number
  // Optional APR group info when the PR contains an APR as a single grouped entry
  aprGroup?: {
    id?: string
    aprId?: string
    aprNumber: string
    officeCode?: string
    officeName?: string
    totalAmount?: number
    items: PRItem[]
  }
  // APR-specific metadata (when this PRItem was created from an APR item)
  originalNeeded?: number
  outOfStockQuantity?: number
  totalGot?: number
  editedNeeded?: number
  // Per-month quantity breakdown (January..December) when available
  monthlyQuantities?: Record<string, number>
}

export interface PurchaseRequest {
  id: string
  type: PRType
  status: PRStatus
  headerDetails: PRHeaderDetails
  items: PRItem[]
  totalAmount: number
  officeCode?: string
  officeName?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  remarks?: string
  torAttachment?: PRAttachment | null
  signedPdfUrl?: string
  // BAC Multi-source metadata
  approvalOrigin?: 'STANDARD' | 'APPROVED_VIA_BAC'
  bacResolutionNumber?: string
  modeOfProcurement?: string
}

export interface PPMPItemMonthAllocation {
  month: string
  totalAllocated?: number
  availableQuantity?: number
  totalAvailableAmount?: number
}

export interface PPMPItem {
  id: string
  itemName: string
  category: string
  isCse: boolean
  quantity: number
  unitOfMeasure: string
  estimatedUnitPrice: number
  totalAmount: number
  month: string
  fund: string
  monthlyAllocations?: PPMPItemMonthAllocation[]
  itemId?: string
}

export interface APRItem {
  fund: string | undefined
  month: string | undefined
  id: string
  itemName: string
  category: string
  quantity: number
  outOfStockQuantity: number
  unitOfMeasure: string
  unitPrice: number
  totalAmount: number
  cnasReferenceNumber?: string
  monthlyQuantities?: Partial<Record<string, number>>
}

export interface APR {
  id: string
  aprNumber: string
  status: string
  items: APRItem[]
  totalAmount: number
  officeCode: string
  officeName: string
}

export interface PRDashboardMetrics {
  totalPPMPAmount: number
  totalSubmittedPRAmount: number
  availableBalance: number
  prCount: {
    draft: number
    submitted: number
    approved: number
    returned: number
  }
}

export interface ProcessedPPMPItem {
  id: string
  itemId: string
  itemName: string
  description?: string
  category: string
  itemCategory?: string
  uacsCode?: string
  isCse: boolean
  unitOfMeasure: string
  estimatedUnitPrice: number
  totalAmount: number
  fund: string
  hasMonthlyAllocations?: boolean
  plannedQuantity?: number
  availableQuantity?: number
  monthlyAllocations: import('./apiTypes').EligiblePpmpItemMonthAllocation[]
  monthlyQuantities?: Partial<Record<string, number>>
  month?: string
}

export interface ProcessedPPMPDoc {
  id: string
  documentName: string
  officeCode: string
  officeName?: string
  items: ProcessedPPMPItem[]
}

export interface SourceAPRItem {
  id: string
  itemName: string
  category: string
  quantity: number
  outOfStockQuantity?: number
  currentFulfilled?: number
  originalNeeded?: number
  totalGot?: number
  editedNeeded?: number
  unitOfMeasure: string
  unitPrice: number
  totalAmount: number
  fund?: string
  month?: string
  monthlyQuantities?: Partial<Record<string, number>>
}
