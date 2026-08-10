/**
 * Manage Supplier Portal Feature
 * 
 * A dedicated workspace for procurement officers to review and evaluate
 * supplier applications submitted through the public supplier portal.
 * 
 * SCOPE: This feature is for OFFICERS ONLY - view, review, evaluate
 * DO NOT include supplier registration, creation, or procurement library features
 * 
 * FEATURE BOUNDARIES:
 * ✅ Allowed: View projects, applicants, documents, set evaluation status, download files
 * ❌ Not Allowed: Create projects, manage suppliers, register suppliers, edit procurement library
 * 
 * ARCHITECTURE:
 * - Feature-based organization with clear separation of concerns
 * - API handler blueprints following erpez-shared-lib patterns
 * - Jotai atoms for shared state management
 * - TanStack Form + Zod for form validation
 * - Mock data for development (TODO: Replace with API integration)
 */

// Pages
export { default as ManageSupplierPortalPage } from './pages/ManageSupplierPortalPage'
export { default as ManageSupplierPortalProjectPage } from './pages/ManageSupplierPortalProjectPage'

// Components
export { ApplicantList } from './components/ApplicantList'
export { ReviewWorkspace } from './components/ReviewWorkspace'

// Hooks
export { useSupplierEvaluation } from './hooks/useSupplierEvaluation'

// Forms
export { EvaluationForm } from './forms/EvaluationForm'
export type { EvaluationFormValues } from './forms/EvaluationForm'

// Dialogs
export { UnsavedChangesDialog } from './dialogs/UnsavedChangesDialog'

// Types
export type { Project, SupplierBid, EvaluationState } from './types/uiTypes'
export type {
  ProcurementProjectResponse,
  SupplierApplicationResponse,
  DocumentResponse,
  UpdateApplicationEvaluationPayload,
} from './types/apiTypes'

// Handlers (for API integration)
export {
  getProjectsRequest,
  getSupplierApplicationsRequest,
  updateApplicationEvaluationRequest,
  getApplicationDocumentsRequest,
  downloadDocumentRequest,
} from './handlers'

// Atoms
export {
  evaluationStateAtom,
  selectedApplicationIdAtom,
  hasUnsavedChangesAtom,
} from './atoms'

// Utils
export { bulkDownloadDocuments } from './utils/bulkDownload'
