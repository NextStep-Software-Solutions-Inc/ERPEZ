/**
 * Market Scoping Feature - Barrel Exports
 * Location: src/features/planning/market-scoping/
 */

// Types
export type {
  MarketScopingForm,
  ActivityEvidence,
  ParameterEvaluation,
  FileAttachment,
  ApprovalRoutingStep,
  MarketScopingApiResponse,
  MarketScopingListResponse,
  PdfGenerationResponse,
  ApprovalActionPayload,
  StepValidationResult,
} from './types/marketScopingTypes'

export { FormStep } from './types/marketScopingTypes'

export type {
  CreateMarketScopingRequest,
  UpdateMarketScopingRequest,
  AddActivityEvidenceRequest,
  UpdateParameterEvaluationRequest,
  SubmitForApprovalRequest,
  ApproveRejectRequest,
  ListMarketScopingParams,
  ListMarketScopingResponse,
  GetMarketScopingResponse,
  ApiResponse,
} from './types/marketScopingApiTypes'

// Management Types
export type {
  ActivityTypeDefinition,
  ParameterDefinition,
  ActivityTypeResponse,
  ParameterResponse,
  CreateActivityTypePayload,
  UpdateActivityTypePayload,
  CreateParameterPayload,
  UpdateParameterPayload,
} from './types/managementTypes'

// Handlers
export { getMarketScopingsRequest } from './handlers/getMarketScopingsRequest'

export { getMarketScopingDetailsRequest } from './handlers/getMarketScopingDetailsRequest'

export { createMarketScopingRequest } from './handlers/createMarketScopingRequest'

export { updateMarketScopingRequest } from './handlers/updateMarketScopingRequest'

export { submitMarketScopingRequest } from './handlers/submitMarketScopingRequest'

export { approveMarketScopingRequest } from './handlers/approveMarketScopingRequest'

export { rejectMarketScopingRequest } from './handlers/rejectMarketScopingRequest'

export { generatePdfRequest } from './handlers/generatePdfRequest'

export { getApprovedForPPMPRequest } from './handlers/getApprovedForPPMPRequest'

export type { PPMPMarketScopingPrerequisite } from './handlers/getApprovedForPPMPRequest'

export { deleteMarketScopingRequest } from './handlers/deleteMarketScopingRequest'

export { uploadFileRequest } from './handlers/uploadFileRequest'

export { getPersonnelPositionsRequest } from './handlers/getPersonnelPositionsRequest'

export type { PersonnelPosition } from './handlers/getPersonnelPositionsRequest'

// Management Handlers
export {
  getActivityTypesRequest,
  createActivityTypeRequest,
  updateActivityTypeRequest,
  deleteActivityTypeRequest,
} from './handlers/getActivityTypesRequest'

export {
  getParametersRequest,
  createParameterRequest,
  updateParameterRequest,
  deleteParameterRequest,
} from './handlers/getParametersRequest'

// Components
export { FormWizard } from './forms/FormWizard'

export { ProjectOverviewForm } from './forms/ProjectOverviewForm'

export { ActivitiesConductedForm } from './forms/ActivitiesConductedForm'

export { ParameterEvaluationForm } from './forms/ParameterEvaluationForm'

export { ReviewSubmitForm } from './forms/ReviewSubmitForm'

export { MarketScopingOverview } from './components/MarketScopingOverview'

export { MarketScopingCardView } from './components/MarketScopingCardView'

export { MarketScopingGuideDialog } from './components/MarketScopingGuideDialog'

// Detail Page Components (Modular)
export {
  ProjectOverviewSection,
  ActivitiesSection,
  ParametersSection,
  ApprovalRoutingSection,
  ApprovalDialog,
} from './components'

// Dialogs
export {
  CreateMarketScopingDialog,
  DeleteMarketScopingDialog,
  ManageActivityTypeDialog,
  ManageParameterDialog,
  DeleteActivityTypeDialog,
  DeleteParameterDialog,
} from './dialogs'

// Tables (Management) - Column factories, toolbars, and actions for TemplateTable pattern
export {
  createActivityTypesTableColumns,
  ActivityTypesTableToolbar,
  ActivityTypesTableActions,
  createParametersTableColumns,
  ParametersTableToolbar,
  ParametersTableActions,
} from './tables'

// State Management
export {
  draftMarketScopingAtom,
  currentFormStepAtom,
  formErrorsAtom,
  isFormSavingAtom,
  isGeneratingPdfAtom,
  checkedActivitiesAtom,
  fileUploadProgressAtom,
  hasUnsavedChangesAtom,
  viewDetailsTabAtom,
  approvalActionTypeAtom,
  rejectionReasonAtom,
  isCurrentStepValidAtom,
  isFormCompleteAtom,
  resetFormStateAtom,
  createMarketScopingDialogOpenAtom,
  deleteMarketScopingDialogOpenAtom,
  selectedMarketScopingForDeleteAtom,
  marketScopingListFilterAtom,
  marketScopingViewTypeAtom,
  marketScopingGuideOpenAtom,
} from './atoms/marketScopingStateAtom'

// Management State (Activities & Parameters)
export {
  selectedActivityTypeForEditAtom,
  selectedActivityTypeForDeleteAtom,
  activityTypeListFilterAtom,
  activityTypesAtom,
  selectedParameterForEditAtom,
  selectedParameterForDeleteAtom,
  parameterListFilterAtom,
  parametersAtom,
  activityTypeDialogOpenAtom,
  parameterDialogOpenAtom,
} from './atoms/managementStateAtoms'

// Utilities
export {
  projectOverviewSchema,
  activityEvidenceSchema,
  activitiesConductedSchema,
  parameterEvaluationSchema,
  parameterEvaluationStepSchema,
  completeMarketScopingSchema,
  validateBudgetPeriod,
  validateDeliveryDate,
  fieldErrorMessages,
} from './utils/validationRules'

export type {
  ProjectOverviewFormData,
  ActivityEvidenceFormData,
  ParameterEvaluationFormData,
} from './utils/validationRules'

export {
  transformApiResponseToForm,
  transformFormToCreatePayload,
  transformFormToUpdatePayload,
  initializeActivities,
  initializeParameters,
  formatCurrency,
  formatDateMonthYear,
  formatFileSize,
  getStatusBadgeVariant,
} from './utils/transformers'

export { transformPersonnelToUserProfile } from './utils/transformPersonnelToUserProfile'

export type { TransformedUserProfile } from './utils/transformPersonnelToUserProfile'

export {
  MARKET_SCOPING_ENDPOINTS,
  MARKET_SCOPING_STATUSES,
  getStatusByValue,
  ACTIVITY_TYPES,
  NGPA_PARAMETERS,
  FORM_STEPS,
  FILE_UPLOAD_CONFIG,
  MARKET_SCOPING_QUERY_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './utils/constants'

export {
  useMarketScopings,
  useMarketScopingDetails,
  useCreateMarketScoping,
  useUpdateMarketScoping,
  useSubmitMarketScoping,
  useApproveMarketScoping,
  useRejectMarketScoping,
  useGeneratePdf,
  useDeleteMarketScoping,
  useUploadFile,
} from './utils/hooks'

export { useApprovedMarketScopingForPPMP } from './hooks/useApprovedMarketScopingForPPMP'

export { usePersonnelPositions } from './hooks/usePersonnelPositions'

// Mock Data (for development/testing)
