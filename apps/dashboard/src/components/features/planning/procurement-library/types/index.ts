import type { ProcurementModeDisplay } from '@/lib/fiscal-year-and-policies/procurement-threshold.types'
import type {
  CreateItemPricePayload,
  ItemPriceComparison,
  ItemPriceListItem,
} from '@/features/planning/procurement-library/item-price/types'

// Item Master Types
export interface ItemMaster {
  id: string
  itemName: string
  uacsCode: string
  uacsDescription: string
  isCSE: boolean
  unspscCode: string
  // Item type indicates whether the item is Expendable, SemiExpendable, Equipment or PPE.
  itemType: 'Expendable' | 'SemiExpendable' | 'Equipment' | 'PPE'

  // Display fields expected by the UI (mapped from backend ProcurementItem)
  minimumTechnicalSpecifications: string
  uom: string
  itemLife: string
  status: 'active' | 'inactive'

  itemLifeUnit: 'days' | 'weeks' | 'months' | 'years'
  productCode: string
  imageURL: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  objectCodeId?: string
  objectCodeName?: string
  unspscCodeId?: string
  unspscCodeName?: string
  uomId?: string
  uomName?: string
  isActive: boolean
}

export interface ItemMasterFormData {
  itemName: string
  uacsCode: string
  objectCodeId: string
  objectCodeName: string
  isCSE: boolean
  unspscCode: string
  unspscCodeId?: string
  minimumTechnicalSpecifications: string
  uom: string
  uomId: string
  uomName: string
  itemType: 'Expendable' | 'SemiExpendable' | 'Equipment' | 'PPE'
  itemLife: string
  itemLifeUnit: 'days' | 'weeks' | 'months' | 'years'
  productCode: string
  imageURL: string
}

// Modes of Procurement Types (imported from backend)
// Re-export for component use
export type ModeOfProcurement = ProcurementModeDisplay & {
  auditLogs?: ModeAuditLog[]
}

export interface ModeOfProcurementFormData {
  name: string
  description: string | null
  procurementCategoryId: string
  isActive?: boolean
  minThreshold: string
  maxThreshold: string
}

/** Form data for creating/editing a sub-procurement mode */
export interface SubModeFormData {
  name: string
  description: string | null
  /** Must fall within parent threshold bounds */
  minThreshold: string
  maxThreshold: string
}

export interface ModeAuditLog {
  id: string
  modeId: string
  action: 'create' | 'update' | 'delete' | 'archive' | 'restore'
  timestamp: Date
  user: string
  changes?: string[]
}

// Price Catalogue Types
export interface PriceHistory extends ItemPriceComparison {}

export interface PriceCatalogueItem extends ItemPriceListItem {
  itemName: string
  itemId: string
  fiscalYear: number
  lastUpdated: string
  priceHistory?: PriceHistory[]
  deletedAt?: string | null
}

export type PriceCatalogueFormData = CreateItemPricePayload

// Unit of Measurement Types
export interface UnitOfMeasurement {
  id: string
  name: string
  abbreviation: string
  parentUnitId?: string
  parentUnitName?: string
  conversionFactor: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  usedByActiveItems: boolean
  deletedAt?: string | null
}

export interface UnitOfMeasurementFormData {
  name: string
  abbreviation: string
  parentUnitId?: string
  conversionFactor: number
  status?: 'active' | 'inactive'
}

// Supplier Registry Types
export interface SupplierRegistry {
  id: string
  supplierCategory: string
  supplierName: string
  businessPermitNo: string
  tinNumber: string
  address: string
  contactPerson: string
  contactNumber: string
  contactEmail: string
  philGEPSNumber: string
  mayorPermitExpiry: string
  dtiExpiry: string
  industryCategories: string[]
  isBlacklisted: boolean
  blacklistReason?: string
  reviewerUserId: string
  url: string
  isVerified: boolean
  status: 'pending' | 'under_review' | 'approved' | 'declined'
  documents?: SupplierDocument[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface SupplierRegistryFormData {
  supplierCategory: string
  supplierName: string
  businessPermitNo: string
  tinNumber: string
  address: string
  contactPerson: string
  contactNumber: string
  contactEmail: string
  philGEPSNumber: string
  mayorPermitExpiry: string
  dtiExpiry: string
  industryCategories: string[]
  isBlacklisted: boolean
  blacklistReason?: string
  reviewerUserId: string
  url: string
  isVerified: boolean
  status: 'pending' | 'under_review' | 'approved' | 'declined'
}

// Procurement Activities Types
export interface ProcurementActivity {
  id: string
  activityName: string
  description?: string
  minDays: number
  maxDays: number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface ProcurementActivityFormData {
  activityName: string
  description?: string
  minDays: number
  maxDays: number
}

export interface ActivityModeMapping {
  modeId: string
  modeName: string
  activities: string[] // Activity IDs
}

// RBAC Actions
export type ProcurementAction = 'write' | 'delete' | 'read' | 'approve'

// Document Types
export interface SupplierDocument {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
  url: string
}

// Threshold Types
export interface ProcurementThreshold {
  id: string
  modeId: string
  modeName: string
  minAmount: number
  maxAmount: number
  effectivityStart: string
  effectivityEnd?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface ProcurementThresholdFormData {
  minAmount: number
  maxAmount: number
  effectivityStart?: string
  effectivityEnd?: string
}

// Category Management Types
export interface Category {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  isInUse: boolean
  code?: string
  canHaveChildren: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CategoryFormData {
  name: string
  description?: string
}

// UNSPSC Code Management Types
export interface UNSPSCode {
  id: string
  Key: string
  ParentId?: string
  ParentName?: string
  Name: string
  Code: string
  Level: number
  IsActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface UNSPSCodeFormData {
  ParentId?: string | null
  Name?: string | null
  Code?: string | null
  Level: number
  IsActive?: boolean
}

export interface UNSPSCCodeResponse {
  id: string
  code: string | null
  name: string | null
  description: string | null
  level: number
  isActive: boolean
  parentId: string | null
  parentName: string | null
  children: UNSPSCCodeResponse[] | null
  createdAt: string
  updatedAt: string | null
}
