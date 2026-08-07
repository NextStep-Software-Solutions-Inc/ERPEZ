/**
 * Budget Distribution Module
 * Consolidated module for budget distribution and office assignment
 * Includes Step 3 workflows: Base KPI targets, Office assignment, Target distribution
 */

// Forms & Components
export { BudgetDistributionForm } from './form'
export { BaseKPITargetsForm, OfficeTargetDistributionForm, OfficeAssignmentCustomizationForm } from './form'

// Tables & UI
export { 
  useBudgetDistributionColumns, BudgetDistributionToolbar, BudgetDistributionActions,
  useOfficeAssignmentColumns, OfficeAssignmentToolbar, OfficeAssignmentActions 
} from './table'

// Dialogs
export { 
  BudgetAllocationDialog, BudgetDistributionDeleteDialog,
  OfficeAssignmentEditDialog, OfficeAssignmentDeleteDialog,
  AddKPIDialog, OfficeAssignmentDialog 
} from './dialogs'

// Handlers - Local state utilities
export { useBudgetDistributionHandlers } from './utils/budgetDistributionUtils'
export { useOfficeAssignmentHandlers } from './utils/officeAssignmentUtils'

// API Request Handlers - React Query blueprints
export { 
  getBudgetAllocationsRequest,
  updateBudgetAllocationRequest,
  getOfficeAssignmentsRequest,
  updateOfficeAssignmentRequest
} from './handlers'

// State & Mocks
export { 
  budgetAllocationsAtom, selectedAllocationAtom, budgetDistributionSearchAtom,
  officeAssignmentsAtom, selectedAssignmentAtom, officeAssignmentSearchAtom 
} from './atoms'
export { 
  MOCK_BUDGET_ALLOCATIONS, MOCK_OFFICES, MOCK_CURRENT_OFFICE, MOCK_OFFICE_ASSIGNMENTS,
  type BudgetAllocation, type OfficeAssignment 
} from './mocks'

// Constants
export { AGGREGATION_TYPE_LABELS, STATUS_CONFIG, ERROR_MESSAGES, VALIDATION_RULES } from './constants'

// Types
export type { BaseKPITarget, TargetRow, Office } from './types'
