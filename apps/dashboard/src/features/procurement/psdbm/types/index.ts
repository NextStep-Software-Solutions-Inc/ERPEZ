/**
 * PSDBM (Philippine Statistics Development & Budget Management) Types
 * 
 * Defines all data structures for PSDBM catalog integration
 * PSDBM provides PS-PhilGEPS commodity catalog access through three modes:
 * - Main: National catalog
 * - Regional: Depot-based regional catalog
 * - LGU: Local Government Unit specific catalog
 */

/**
 * PSDBM Catalog Mode - Determines which endpoint is used
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
 * Raw PSDBM Item parsed from HTML catalog response
 * Minimal fields from PS-PhilGEPS item catalog
 */
export interface PSDBMItem {
  itemCode: string // e.g., "44122105-BF-C02"
  description: string // e.g., "CLIP, Backfold, 25mm"
  unitPrice: number // Price per unit in PHP
  unit: string // e.g., "BOX", "ROLL", "PIECE", "GALLON", "BOTTLE"
  imageUrl: string // URL to item image
  availability: PSDBMItemAvailability | 'Available' | 'Limited' | 'Out of Stock'
}

/**
 * PSDBM Regional Depot (for Regional mode)
 */
export interface PSDBMDepot {
  id: string
  name: string // e.g., "BAGUIO", "CEBU", "DAVAO"
  region?: string
}

/**
 * PSDBM Commodity Category
 */
export interface PSDBMCategory {
  id: string
  name: string // e.g., "Office Supplies", "Janitorial", "Safety Equipment"
  itemCount?: number
}

/**
 * PSDBM Search & Filter Parameters
 */
export interface PSDBMSearchParams {
  search?: string // Search term for item code or description
  category?: string // Category filter
  max?: number // Results per page (default: 25, recommended: 25-50)
  depot?: string // Depot name (Required for Regional/LGU modes)
  mode: PSDBMCatalogMode // Catalog mode selector
}

/**
 * Parsed PSDBM Catalog API Response
 */
export interface PSDBMCatalogResponse {
  items: PSDBMItem[]
  category: string // Category being browsed
  searchTerm: string // Search term used
  mode: PSDBMCatalogMode
  depot?: string // Depot used (for Regional/LGU)
  totalItems?: number
  isMockData: boolean // Indicates if this response contains mock/fallback data
}

/**
 * Request payload for fetching PSDBM items
 */
export interface GetPSDBMItemsPayload extends PSDBMSearchParams {
  // Inherits all search parameters
}

/**
 * Request payload for fetching PSDBM categories
 */
export interface GetPSDBMCategoriesPayload {
  mode: PSDBMCatalogMode
}

/**
 * Request payload for fetching PSDBM depots
 */
export interface GetPSDBMDepotsPayload {
  // No required parameters
}

/**
 * Adapter: Convert PSDBM Item to APR ConsolidatedAPRItem
 * Used when user adds PSDBM items to APR
 */
export interface PSDBMToAPRItemAdapter {
  // Required from PSDBM
  psdbmItemCode: string // Original PSDBM code for reference/traceability
  itemCode: string // Same as psdbmItemCode, normalized for APR
  description: string // Item description
  unit: string // Unit of measurement
  unitCost: number // Unit price from PSDBM

  // User inputs when adding to APR
  quantity: number // User-specified quantity (default: 1)
  office: string // Office/Department requesting
  fundSource: string // Fund source (e.g., "General Fund", "SEF")

  // Calculated fields
  totalAmount: number // unitCost × quantity

  // APR-specific fields (defaults for PSDBM items)
  itemCategory: string // Always "Goods" for PSDBM
  allotmentClass: 'MOOE' | 'CO' // Default: MOOE for PSDBM
  sourceFiscalYear: number // Current fiscal year
  sourceCategory: string // PSDBM category
  psdbmCatalogMode: PSDBMCatalogMode // Track which catalog this came from
  psdbmDepot?: string // Depot if from Regional/LGU mode
}

/**
 * PSDBM Item with quantity for AddItem dialog
 * Extends PSDBMItem with quantity user input
 */
export interface PSDBMItemWithQuantity extends PSDBMItem {
  quantity: number // User-specified quantity (default: 1)
  selectedOffice?: string // User-selected office
  selectedFundSource?: string // User-selected fund source
}
