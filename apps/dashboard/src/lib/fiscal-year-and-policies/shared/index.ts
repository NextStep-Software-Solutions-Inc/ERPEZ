import { FiscalYearSelectorHandle } from './components'
/**
 * Shared Types & Utilities - Barrel Export
 */

export type {
  BudgetCall,
  ProcurementThreshold,
  RatingScale,
  RatingLevel,
  FunctionWeight,
  CreateFiscalYearPayload,
  UpdateFiscalYearPayload,
  CreateEconomicIndicatorPayload,
  UpdateEconomicIndicatorPayload,
  CreateBudgetCallPayload,
  UpdateBudgetCallPayload,
  CreateProcurementThresholdPayload,
  UpdateProcurementThresholdPayload,
  CreateRatingScalePayload,
  UpdateRatingScalePayload,
  PaginationMeta,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
  SortParams,
  FiscalYearFilters,
  BudgetCallFilters,
  ProcurementThresholdFilters,
} from './types'

export {
  FiscalYearStatus,
  BudgetCallStatus,
  PolicyType,
  FunctionCategory,
  ProcurementMethodType,
  QETDimension,
} from './types'

export {
  createFiscalYearSchema,
  updateFiscalYearSchema,
  createEconomicIndicatorSchema,
  createBudgetCallSchema,
  createProcurementThresholdSchema,
  createRatingScaleSchema,
  ratingLevelSchema,
  batchCreateSchema,
} from './types/validation'

export type {
  CreateFiscalYearFormValues,
  UpdateFiscalYearFormValues,
  CreateEconomicIndicatorFormValues,
  CreateBudgetCallFormValues,
  CreateProcurementThresholdFormValues,
  CreateRatingScaleFormValues,
} from './types/validation'

export {
  mockFiscalYears,
  mockEconomicIndicators,
  mockBudgetCalls,
  mockProcurementThresholds,
  mockRatingScales,
  createMockPaginatedResponse,
} from './types/mock-data'
