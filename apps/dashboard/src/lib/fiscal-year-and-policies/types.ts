import { Cluster } from '@/components/features/planning/office/office/table/types'
import { FiscalYear } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/types/types'

// Tax & Economic Indicators
export type TaxEconomicIndicator = {
  id: string
  fiscalYearId: string
  vatRate: number // 2 decimals (e.g., 12.00 for 12%)
  inflationRate: number // 2 decimals
  incomeTaxRate: number // 2 decimals
  createdAt: string
  updatedAt: string
}

// Budget Call
export type BudgetCall = {
  id: string
  fiscalYearId: string
  type:
    | 'InitialProposal'
    | 'SupplementalBudget'
    | 'BudgetRevision'
    | 'MidYearReview'
    | 'YearEndAdjustment'
  submissionDeadline: string // ISO date string
  createdAt: string // start date (ISO date string)
  updatedAt?: string
  name?: string // Optional budget call name/description
}

// Legacy support for BudgetCall with old endDate field
export type BudgetCallWithLegacy = BudgetCall & {
  endDate?: string // Legacy field
}

// SPMS Function Weight Configuration
export type FunctionConfig = {
  id: string
  fiscalYearId: string
  strategicMinWeight: number // 2 decimals
  strategicMaxWeight?: number // 2 decimals (nullable)
  coreFunctionMinWeight: number // 2 decimals
  coreFunctionMaxWeight?: number // 2 decimals (nullable)
  supportMinWeight: number // 2 decimals
  supportMaxWeight?: number // 2 decimals (nullable)
  createdAt: string
  updatedAt: string
}

// General Rating Scale (5-level standard per fiscal year)
export type GeneralRatingScale = {
  id: string
  fiscalYearId: string
  fiscalYearYear: number
  adjectivalRatingName: string // e.g., "Excellent", "Very Good", "Good", "Fair", "Below Average"
  description?: string // Optional description
  minScore: number // Decimal 0.00-5.00
  maxScore: number // Decimal 0.00-5.00
  createdAt: string
  updatedAt: string
}

export type FiscalMonth = {
  id: string
  fiscalYearId: string
  name: string
  monthIndex: number
  isLocked: boolean
  modifiedByUserId?: string
  createdAt: string
  updatedAt: string
}

export type FunctionConfiguration = {
  id: string
  fiscalYearId: string
  functionType: 'strategic' | 'core' | 'support'
  min: number
  max: number | null
  fullyRequired: boolean
  createdAt: string
  updatedAt: string
}

export type RatingScaleItem = {
  id: string
  label: string
  description: string
  min: number
  max: number
}

// Form state for GeneralRatingScale editing
export type RatingScaleFormState = {
  isOpen: boolean
  mode: 'edit' | 'view'
  scaleId: string | null
  formData: Partial<GeneralRatingScale>
  validationErrors: ValidationError[]
}

// Validation error with suggestion
export type ValidationError = {
  type: 'rangeInvalid' | 'overlapping' | 'gap' | 'boundaryError'
  message: string
  suggestion?: string
  conflictingScaleId?: string
}

// Conflict detection result
export type OverlapConflict = {
  scaleId: string
  scaleName: string
  minScore: number
  maxScore: number
  suggestion: string
}

// Function configuration validation result
export type FunctionConfigValidationResult = {
  isValid: boolean
  errors: {
    strategic: string[]
    core: string[]
    support: string[]
  }
}

// Rating scale format type
export type RatingScaleFormat = 'decimal' | 'percentage'

// Validation result for rating scale
export type RatingValidationError = {
  type:
    | 'overlapping'
    | 'gap'
    | 'outOfBounds'
    | 'countMismatch'
    | 'minMaxInvalid'
  message: string
  details?: Record<string, unknown>
}

export type RatingValidationResult = {
  isValid: boolean
  errors: RatingValidationError[]
}

export type User = {
  id: string
  name: string
  department: string
  position: string
}

export type UserDepartment = {
  userId: string
  departmentId: string
}

export type Department = {
  id: string
  name: string
  code: string
}

export type DataRolloverOptions = {
  copyOrgStructure: boolean
  copyUACSLibrary: boolean
  copyRecurringExpenses: boolean
}

// NEW: Edit mode state for individual economic indicator fields
export type EconomicIndicatorField =
  | 'vatRate'
  | 'incomeTaxRate'
  | 'inflationRate'

export type EditState = {
  field: EconomicIndicatorField
  isEditing: boolean
  tempValue: number
  originalValue: number
}

// NEW: State for confirmation dialog
export type ConfirmationDialogState = {
  isOpen: boolean
  field: EconomicIndicatorField
  originalValue: number
  proposedValue: number
  fieldLabel: string
}

// NEW: Rollover progress state management
export type RolloverProgressState = {
  isMinimized: boolean
  isRollingOver: boolean
  rolloverProgress: number
  hasCompletedSuccessfully: boolean
  sourceYearId: string
  targetYearId: string
  selectedOptions: DataRolloverOptions
}

// NEW: Rollover completion data for modal display
export type RolloverCompletionData = {
  sourceYear: FiscalYear
  targetYear: FiscalYear
  options: DataRolloverOptions
  completedAt?: Date
}

// REDESIGN: Threshold boundary (inherited, read-only)
export type ThresholdBoundary = {
  min: number
  max: number
  label: string // e.g., "Inherited"
}

// REDESIGN: Filter state
export type FilterState = {
  id: string
  label: string
  type: 'boundary' | 'threshold'
  condition?: string // e.g., "Min >= 100"
}

// REDESIGN: Toolbar state
export type ToolbarState = {
  searchTerm: string
  activeFilters: string[]
}

// REDESIGN: Paginated list state
export type PaginationState = {
  currentPage: number
  pageSize: number
  totalPages: number
}
// NEW: Organization entity for workflow matrix
export type Organization = {
  id: string
  name: string
  description?: string
  clusterId: string
  officeHead: string
  address: string
  country: string
  email: string
  contactNumber: string
  responsibilityCenterCode?: string
  cluster?: Cluster
  code?: string
  isDeliveryUnit: boolean
  createdAt: string
  updatedAt: string
}

// Annual Signatory Matrix - Department-to-User mappings for approval routing
export type SignatoryRole = 'recommending' | 'final'

export type SignatoryAssignment = {
  id: string
  fiscalYearId: string
  departmentId: string
  documentType?: string | null
  role: SignatoryRole // 'recommending' | 'final'
  signatoryUserId: string
  signatoryUserName?: string
  createdAt: string
  updatedAt: string
  departmentName?: string
  recommendingApproverId?: string
  recommendingApproverName?: string
  finalApproverId?: string
  finalApproverName?: string
}

export type SignatoryMatrixResponse = {
  succeeded: boolean
  message: string | null
  data: SignatoryAssignment | SignatoryAssignment[]
  errors?: Record<string, string[]> | null
  pageNumber?: number
  pageSize?: number
  totalPages?: number
  totalCount?: number
}

// UI Presentation type for table rows
export type SignatoryMatrixRow = {
  departmentId: string
  departmentName: string
  departmentCode: string
  recommendingApproverId: string
  recommendingApproverName: string | null
  finalApproverId: string
  finalApproverName: string | null
  createdAt: string
  updatedAt: string
}

// Agency Master Budget (Fund Cluster)
export type AgencyMasterBudgetFiscalYear = {
  id: string
  year: number
  description: string | null
  status: string | null
  isLocked: boolean
  startDate: string | null
  endDate: string | null
}

export type AgencyMasterBudgetFundSource = {
  id: string
  name: string | null
  code: string | null
  type: string | null
  isActive: boolean
  parentId: string | null
  parentName: string | null
  fiscalYearId: string | null
}

// Office Ceiling - nested sub-types
export type OfficeCeilingFiscalYear = {
  id: string
  year: number
  description: string | null
}

export type OfficeCeilingOffice = {
  id: string
  name: string | null
  code: string | null
}

export type OfficeCeilingAgencyMasterBudget = {
  id: string
  sourceDocumentType: number
  sourceDocumentTypeEnum: number[]
  fundSourceId: string
  fiscalYearId: string
  psAmount: number
  mooeAmount: number
  coAmount: number
}

export type OfficeCeiling = {
  id: string
  fiscalYearId: string
  targetType: number
  targetTypeEnum: number[]
  officeId: string
  agencyMasterBudgetId: string
  psAmount: number
  mooeAmount: number
  coAmount: number
  status: number
  statusEnum: number[]
  isSupplemental: boolean
  fiscalYear: OfficeCeilingFiscalYear
  office: OfficeCeilingOffice
  agencyMasterBudget: OfficeCeilingAgencyMasterBudget
  subOfficeCeilingCount: number
}

export type AgencyMasterBudget = {
  id: string
  fiscalYearId: string
  fundSourceId: string
  sourceDocumentType: number
  sourceDocumentTypeEnum: number[]
  psAmount: number
  mooeAmount: number
  coAmount: number
  fiscalYear: AgencyMasterBudgetFiscalYear
  fundSource: AgencyMasterBudgetFundSource
  officeCeilings: OfficeCeiling[]
}

// ── Sub-Office Ceiling (Dept. Ceilings) ──────────────────────────────────────

export type SubOfficeCeilingOfficeCeiling = {
  id: string
  officeId: string
  officeName: string | null
  targetType: number
  targetTypeEnum: number[]
}

export type SubOfficeCeilingSubOffice = {
  id: string
  name: string | null
  code: string | null
}

export type SubOfficeCeilingFundSource = {
  id: string
  name: string | null
  code: string | null
  type: string | null
}

export type SubOfficeCeilingFiscalYear = {
  id: string
  year: number
  description: string | null
}

export type SubOfficeCeiling = {
  id: string
  officeCeilingId: string
  subOfficeId: string
  fundSourceId: string
  fiscalYearId: string
  psAmount: number
  mooeAmount: number
  coAmount: number
  status: number
  statusEnum: number[]
  officeCeiling: SubOfficeCeilingOfficeCeiling
  subOffice: SubOfficeCeilingSubOffice
  fundSource: SubOfficeCeilingFundSource
  fiscalYear: SubOfficeCeilingFiscalYear
}

// Re-export procurement types
export type {
  ProcurementCategory,
  ProcurementMode,
  ProcurementModeThreshold,
  ProcurementPolicyConfig,
  ProcurementPolicyConfigWithRelations,
  ProcurementMethod,
} from './procurement-threshold.types'
