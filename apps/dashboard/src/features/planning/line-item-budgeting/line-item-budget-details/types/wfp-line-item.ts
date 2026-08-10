/**
 * WFP Line Item Types
 * Defines interfaces for multi-item WFP line item budget form
 */

export interface WFPLineItem {
  id: string // Temporary ID for form (e.g., Date.now().toString())
  wfpObjectiveActivityExpenditureId: string
  objectId: string // Derived from expenditure.object.id
  description: string
  unitQuantity: number // Whole number, ≥ 1
  unitCost: number // Decimal, ≥ 0.01
}

export interface WFPLineItemFormState {
  lineItems: WFPLineItem[]
  currentFormValues: Partial<WFPLineItem>
  isEditing: boolean | string // false or editing item id
  errors: Record<string, string>
}

export interface CreateWFPLineItemPayload {
  lineItemBudgetId: string
  lineItemBudgetActivityId: string
  wfpObjectiveActivityExpenditureId: string
  objectId: string
  description: string
  unitQuantity: number
  unitCost: number
}

export interface LineItemSubmissionResult {
  item: WFPLineItem
  success: boolean
  error?: string
}

export interface BatchSubmissionResult {
  succeeded: LineItemSubmissionResult[]
  failed: LineItemSubmissionResult[]
  successCount: number
  failureCount: number
}

/**
 * Payload structure for period-based line item budget allocations (Quarterly/Monthly)
 * Used for concurrent period submissions in CreateLineItemBudgetDetailsForm
 */
export interface PeriodAllocationPayload {
  lineItemBudgetId: string
  lineItemBudgetActivityId: string
  wfpObjectiveActivityExpenditureId: undefined
  objectId: string
  description: string | undefined
  timelineType: string
  startDate: string
  endDate: string
  budget: number
}

/**
 * Generic mutation async function parameters
 * Used to type mutation handlers that accept pathParams and payload
 */
export interface MutateAsyncParams<T> {
  pathParams: Record<string, string>
  payload: T
}
