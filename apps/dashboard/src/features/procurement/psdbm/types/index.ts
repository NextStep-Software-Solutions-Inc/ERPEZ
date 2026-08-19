/**
 * PSDBM (Procurement Service - Philippine Government Electronic Procurement System) Types
 * 
 * Defines data structures for PSDBM local catalogue and stock synchronization
 */

/**
 * PSDBM Catalog Mode - Determines catalog scope
 */
export enum PSDBMCatalogMode {
  MAIN = 'main',
  REGIONAL = 'regional',
  LGU = 'lgu',
}

/**
 * PSDBM Item Availability Status
 */
export enum PSDBMItemAvailability {
  AVAILABLE = 'Available',
  LIMITED = 'Limited',
  OUT_OF_STOCK = 'Out of Stock',
}

/**
 * PSDBM Item from local database / API
 */
export interface PSDBMItem {
  id?: string
  itemCode: string // e.g., "14111507-PP-M01"
  description: string // e.g., "PAPER, MULTICOPY, A4, 80gsm"
  unitPrice: number // Price per unit in PHP
  unit: string // e.g., "REAM", "BOX", "ROLL", "PIECE", "GALLON", "BOTTLE"
  imageUrl?: string // URL to item image
  technicalSpecificationUrl?: string // PDF tech specs URL
  availability: PSDBMItemAvailability | 'Available' | 'Limited' | 'Out of Stock' | string
  availableStock?: number // Authoritative Stock on Hand
  remainingQtyForDelivery?: number // Pending delivery quantity
  category?: string // Category name
  lastSyncedAt?: string // ISO timestamp of last stock snapshot
  depot?: string // Depot name if filtered by depot
}

/**
 * PSDBM Regional Depot (for Regional/LGU mode)
 */
export interface PSDBMDepot {
  id: string
  name: string // e.g., "BAGUIO", "CEBU", "DAVAO"
  region?: string
  mode?: string
}

/**
 * PSDBM Commodity Category
 */
export interface PSDBMCategory {
  id: string
  name: string // e.g., "Paper Products", "Writing Instruments"
  itemCount?: number
}

/**
 * PSDBM Search & Filter Parameters
 */
export interface PSDBMSearchParams {
  search?: string
  category?: string
  max?: number
  depot?: string
  mode: PSDBMCatalogMode | string
  availability?: string
  stockFilter?: string
  sortBy?: string
  sortDescending?: boolean
  pageNumber?: number
  pageSize?: number
}

/**
 * PSDBM Catalog API Response
 */
export interface PSDBMCatalogResponse {
  items: PSDBMItem[]
  category?: string
  searchTerm?: string
  mode: PSDBMCatalogMode | string
  depot?: string
  totalItems?: number
  pageNumber?: number
  pageSize?: number
  totalPages?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  lastSynchronizedAt?: string
  isMockData?: boolean
}

/**
 * Request payload for fetching PSDBM items
 */
export interface GetPSDBMItemsPayload extends PSDBMSearchParams {}

/**
 * Request payload for fetching PSDBM categories
 */
export interface GetPSDBMCategoriesPayload {
  mode: PSDBMCatalogMode | string
}

/**
 * Request payload for fetching PSDBM depots
 */
export interface GetPSDBMDepotsPayload {}

/**
 * Adapter: Convert PSDBM Item to APR ConsolidatedAPRItem
 */
export interface PSDBMToAPRItemAdapter {
  psdbmItemCode: string
  itemCode: string
  description: string
  unit: string
  unitCost: number
  quantity: number
  office: string
  fundSource: string
  totalAmount: number
  itemCategory: string
  allotmentClass: 'MOOE' | 'CO'
  sourceFiscalYear: number
  sourceCategory: string
  psdbmCatalogMode: PSDBMCatalogMode | string
  psdbmDepot?: string
}

/**
 * PSDBM Item with quantity for AddItem dialog
 */
export interface PSDBMItemWithQuantity extends PSDBMItem {
  quantity: number
  selectedOffice?: string
  selectedFundSource?: string
}

/**
 * PSDBM Synchronization Types
 */
export interface PSDBMSyncRequest {
  syncMode?: 'Full' | 'Stock' | 'Product'
  depots?: string[]
  mode?: 'regional' | 'lgu'
  maxConcurrency?: number
  itemCodeFilter?: string
}

export interface PSDBMSyncResult {
  syncRunId: string
  status: 'Running' | 'Completed' | 'CompletedWithErrors' | 'Failed'
  syncMode: 'Full' | 'Stock' | 'Product'
  startedAt: string
  completedAt?: string
  depotsProcessed: number
  itemsDiscovered: number
  itemsCreated: number
  itemsUpdated: number
  stockRecordsUpdated: number
  errorCount: number
  errors?: Array<{
    itemCode: string
    depot?: string
    errorMessage?: string
  }>
}
