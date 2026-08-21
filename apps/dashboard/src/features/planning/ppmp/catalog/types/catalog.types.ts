/**
 * Catalog Type Definitions
 * Non-CSE Item Catalog & Item Request Workflow types
 */

// ─── Unit of Measure ──────────────────────────────────────────────────────────

export const CATALOG_UOM_OPTIONS = [
  'piece',
  'unit',
  'ream',
  'lot',
  'set',
  'box',
  'roll',
  'liter',
  'kilogram',
  'ton',
  'cubic meter',
  'linear meter',
  'hour',
  'day',
  'month',
  'license',
  'training course',
] as const

export type CatalogUoM = (typeof CATALOG_UOM_OPTIONS)[number]

// ─── Procurement Category ─────────────────────────────────────────────────────

export const PROCUREMENT_CATEGORY_OPTIONS = [
  'Goods',
  'Infra',
  'Consulting',
] as const

export type ProcurementCategory = (typeof PROCUREMENT_CATEGORY_OPTIONS)[number]

export const ITEM_REQUEST_STATUS_OPTIONS = [
  'Draft',
  'Submitted',
  'Approved',
  'Returned',
] as const

export type ItemRequestStatus = (typeof ITEM_REQUEST_STATUS_OPTIONS)[number]

export const CATALOG_ITEM_STATUS_OPTIONS = ['Active', 'Inactive'] as const

export type CatalogItemStatus = (typeof CATALOG_ITEM_STATUS_OPTIONS)[number]

/**
 * Item Request - User submission for new Non-CSE items
 * Status flow: Draft → Submitted → Approved/Returned
 * TWG Review fields: UNSPSC mapping, isCSE classification
 */
export interface ItemRequest {
  id: string
  name: string
  procurementCategory?: ProcurementCategory | string | null
  procurementCategoryId?: string | null
  procurementCategoryName?: string | null
  itemCategory: string // UACS label (e.g., "IT Equipment")
  uacsCode?: string | null // Original UACS code from request
  unitOfMeasure?: string | null
  uomId?: string | null
  uomName?: string | null
  estimatedUnitCost: number
  specifications?: string | null
  technicalSpecification?: string | null
  imageUrl?: string | null
  status: ItemRequestStatus | string
  requestDate: string | Date
  submittedAt?: string | Date | null
  reviewedAt?: string | Date | null
  reviewedBy?: string | null
  requestingOffice?: string
  officeId?: string
  officeName?: string
  requestingUser?: string
  remarks?: string | null // For Return reason (admin-provided)
  twgRemarks?: string | null
  createdBy?: string
  createdAt?: string | Date
  // TWG Review Fields (optional)
  unspscCode?: string | null // UNSPSC mapping set by TWG
  unscpscCode?: string | null
  isCSE?: boolean | null // Common-Use Supply/Equipment toggle set by TWG
}

/**
 * Non-CSE Catalog Item
 * Master catalog item managed by Admin/TWG
 * - status: Visibility in admin catalogs (Active/Inactive)
 * - isActive: Controls if item appears in user/master catalogs
 * - requestingOffice/requestingUser: Origin of the item request (for audit trail)
 * - unspscCode: UNSPSC classification (required, set by TWG during approval)
 * - isCSE: Common-Use Supply/Equipment flag (required, set by TWG during approval)
 */
/**
 * Non-CSE Catalog Item (Note: Future-ready for CSE integration via isCSE flag)
 * When isCSE = false: Non-procurable/Non-CSE item
 * When isCSE = true: Procurable/CSE item (prepared for future integration)
 */
export interface NonCSEItem {
  id: string
  name: string
  category: string
  subcategory?: string | null
  unitOfMeasure: string
  currentPrice: number
  specification: string // Formerly "description"
  itemType: ProcurementCategory
  supplier?: string | null
  imageUrl?: string | null
  status: CatalogItemStatus
  isActive: boolean // Controls visibility in catalogs
  uacsCode?: string | null
  unspscCode: string // UNSPSC code (required, TWG-assigned)
  isCSE: boolean // CSE flag (required, TWG-assigned); default: false (future-proof for CSE integration)
  sourceRequestId?: string | null
  requestingOffice?: string | null // Office that requested this item
  requestingUser?: string | null // User who requested this item
  createdDate: Date
  lastModified: Date
}

export interface CatalogCurrentUser {
  id: string
  name: string
  email: string
  office: string
}

export interface CreateItemRequestInput {
  name: string
  procurementCategory: ProcurementCategory
  itemCategory: string
  uacsCode?: string | null
  unitOfMeasure: string
  estimatedUnitCost: number
  specifications: string
  imageUrl?: string | null
  status?: 'Draft' | 'Submitted'
}

export interface CreateCatalogItemInput {
  name: string
  category: string
  subcategory?: string | null
  unitOfMeasure: string
  currentPrice: number
  specification: string
  itemType: ProcurementCategory
  supplier?: string | null
  imageUrl?: string | null
  isActive?: boolean
  uacsCode?: string | null
  unspscCode: string // Required
  isCSE: boolean // Required
  sourceRequestId?: string | null
}

export interface UpdateCatalogItemInput {
  itemId: string
  changes: Partial<
    Omit<NonCSEItem, 'id' | 'createdDate' | 'lastModified' | 'sourceRequestId'>
  > & {
    sourceRequestId?: string | null
  }
}

export interface ApproveItemRequestInput {
  requestId: string
  catalogItem: CreateCatalogItemInput
  remarks?: string | null
}

export interface ReturnItemRequestInput {
  requestId: string
  remarks: string
}

/**
 * User Role for RBAC
 */
export type UserRole = 'user' | 'admin'

/**
 * Cascading UACS Category structure
 */
export interface UACScascade {
  [key: string]: string[]
}
