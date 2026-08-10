/**
 * @deprecated This file contains legacy catalog types that are being migrated.
 * Use `NonCSEItem`, `CreateCatalogItemInput`, `UpdateCatalogItemInput` from
 * `./catalog.types` for new code. This file will be removed once all consumers
 * are migrated.
 *
 * Non-CSE Catalog Management Types
 * Extended types for the PIM-style catalog admin interface.
 * Builds on the existing CatalogItem type with richer data for management.
 */

// ─── Unit of Measure (hardcoded as per requirements) ──────────────────────────

export const CATALOG_UOM_OPTIONS = [
  'piece',
  'ream',
  'lot',
  'set',
  'box',
  'roll',
] as const

export type CatalogUoM = (typeof CATALOG_UOM_OPTIONS)[number]

// ─── Non-CSE Catalog Item ─────────────────────────────────────────────────────

export type NonCseCatalogItem = {
  id: string
  itemCode: string
  name: string
  description: string | null
  category: string
  subcategory: string | null
  unitOfMeasure: CatalogUoM
  currentPrice: number
  previousPrice: number | null
  lastSurveyDate: string // ISO date "YYYY-MM-DD"
  tags: string[] // Read-only synonyms for discoverability
  status: 'active' | 'inactive'
  /** Locked when referenced in a "Submitted" PPMP — delete disabled, only deactivate allowed */
  isLocked: boolean
  /** Reason for lock (e.g., "Referenced in PPMP-2024-001") */
  reasonLocked: string | null
  /** Number of PPMPs referencing this item */
  referenceCount: number
  supplier: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

// ─── Price History ─────────────────────────────────────────────────────────────

export type PriceHistoryEntry = {
  id: string
  catalogItemId: string
  price: number
  effectiveDate: string // ISO date
  changedBy: string
  reason: 'initial' | 'survey' | 'adjustment' | 'correction'
}

// ─── Audit Log ─────────────────────────────────────────────────────────────────

export type AuditLogAction =
  | 'create'
  | 'update'
  | 'deactivate'
  | 'reactivate'
  | 'bulk_adjust'
  | 'duplicate'

export type AuditLogEntry = {
  id: string
  catalogItemId: string
  action: AuditLogAction
  fieldChanged: string | null
  oldValue: string | null
  newValue: string | null
  changedBy: string
  changedAt: string
  notes: string | null
}

// ─── PPMP Reference ────────────────────────────────────────────────────────────

export type PpmpReference = {
  ppmpId: string
  ppmpCode: string
  ppmpTitle: string
  status: 'draft' | 'pending_review' | 'approved' | 'submitted'
  fiscalYear: number
}

// ─── Pagination / Query Params ─────────────────────────────────────────────────

export type CatalogQueryParams = {
  page: number
  pageSize: number
  search: string
  sortBy: 'name' | 'category' | 'currentPrice' | 'lastSurveyDate' | 'status'
  sortDir: 'asc' | 'desc'
  categoryFilter: string | null
  statusFilter: 'all' | 'active' | 'inactive'
}

export type CatalogPaginatedResult = {
  data: NonCseCatalogItem[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

// ─── Mutation Payloads ────────────────────────────────────────────────────────

export type CreateCatalogItemPayload = {
  name: string
  category: string
  unitOfMeasure: CatalogUoM
  currentPrice: number
  description?: string | null
  subcategory?: string | null
  supplier?: string | null
  tags?: string[]
  status?: 'active' | 'inactive'
}

export type UpdateCatalogItemPayload = {
  name?: string | null
  description?: string | null
  category?: string | null
  subcategory?: string | null
  unitOfMeasure?: CatalogUoM | null
  currentPrice?: number | null
  supplier?: string | null
  tags?: string[] | null
  status?: 'active' | 'inactive' | null
}

// ─── Bulk Adjustment ───────────────────────────────────────────────────────────

export type BulkAdjustmentMode = 'selected' | 'category'

export type BulkAdjustmentPayload = {
  mode: BulkAdjustmentMode
  /** Signed percentage: positive = increase, negative = decrease. Range: -99 to 200 */
  adjustmentPercent: number
  reason: string
  /** Item IDs to adjust (when mode = 'selected') */
  itemIds?: string[]
  /** Category name to adjust (when mode = 'category') */
  category?: string | null
}

export type AdjustmentPreviewItem = {
  id: string
  itemCode: string
  name: string
  category: string
  oldPrice: number
  newPrice: number
  delta: number
}

export type AdjustmentPreview = {
  items: AdjustmentPreviewItem[]
  totalAffected: number
  totalDelta: number
}
