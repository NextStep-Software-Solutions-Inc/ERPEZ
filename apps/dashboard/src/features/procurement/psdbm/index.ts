/**
 * PSDBM Module Index
 * Central export point for all PSDBM-related types, hooks, utilities, and components
 */

// Types
export type {
  PSDBMItem,
  PSDBMDepot,
  PSDBMCategory,
  PSDBMSearchParams,
  PSDBMCatalogResponse,
  PSDBMToAPRItemAdapter,
  PSDBMItemWithQuantity,
} from './types'

export { PSDBMCatalogMode, PSDBMItemAvailability } from './types'

// Hooks
export { usePSDBMItems, usePSDBMCategories, usePSDBMDepots } from './hooks'

// Components
export { PSDBMItemsGrid } from './components'

// Utils
export {
  parseItemsFromHTML,
  extractItemCode,
  extractPrice,
  normalizeImageUrl,
  extractAvailability,
  parsePSDBMCatalogResponse,
} from './utils/parseItemsFromHTML'

export {
  createPSDBMAdapter,
  convertAdapterToAPRItem,
  convertPSDBMItemToAPR,
  convertPSDBMItemsToAPR,
  validatePSDBMConversion,
  calculateAPRItemTotal,
  formatPSDBMItemForDisplay,
} from './utils/convertToAPRItem'

// Mock Data
export {
  mockPSDBMItems,
  filterMockPSDBMItems,
  paginateMockPSDBMItems,
  mockPSDBMCategories,
  mockPSDBMDepots,
} from './mocks'

// Request Handlers
export {
  getPSDBMItemsRequest,
  getPSDBMCategoriesRequest,
  getPSDBMDepotsRequest,
} from './handlers'
