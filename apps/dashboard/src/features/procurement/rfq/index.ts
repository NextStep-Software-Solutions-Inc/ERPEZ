/**
 * RFQ (Request for Quotation) Module
 *
 * Barrel export for the RFQ feature module. Re-exports the primary store,
 * page components, and domain types to provide a clean public API.
 *
 * Usage:
 *   import { useRFQStore, RFQPage, type RFQ, type RFQItem } from '@/features/procurement/rfq'
 */

// Store
export { useRFQStore, fetchActiveSuppliers } from './store/rfqStore'
export type { RFQ, RFQItem, RFQSummary, Supplier, SupplierOption } from './types'

// Pages
export { RFQPage } from './pages/RFQPage'
export { ManageRFQApprovalPage } from './pages/ManageRFQApprovalPage'
export { RFQDetailsPage } from './pages/RFQDetailsPage'

// Components
export { CreateRFQModal } from './components/CreateRFQModal'
export { SetQuotationModal } from './components/SetQuotationModal'
export { AddConsolidatedPRModal } from './components/AddConsolidatedPRModal'

// Types (domain + API/view-model)
export type {
  SupplierRequirementDetail,
  SupplierDetail,
  ConsolidatedPRItem,
} from './types'

// Utilities
export {
  mapStatusEnumToString,
  mapStatusStringToEnumNumber,
  mapBackendRFQToFrontend,
  mapBackendRFQListItemToFrontend,
} from './utils/rfqMappers'
