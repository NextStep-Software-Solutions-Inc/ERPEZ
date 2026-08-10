import { LineItemBudget } from '.'

export type LIBAmendmentReasonEnum =
  | 'UnforeseenModification'
  | 'Reassessment'
  | 'AdditionalRequirements'

export type LIBAmendmentStatusEnum =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Returned'

export type CreateLIBAmendmentPayload = {
  lineItemBudgetId: string
  reason?: string | null
  justification?: string | null
}

export type UpdateLIBAmendmentPayload = {
  lineItemBudgetId: string
  reason?: string | null
  justification?: string | null
}

export type LIBAmendment = {
  id: string
  lineItemBudgetId: string
  proposedLineItemBudgetId: string
  reason: LIBAmendmentReasonEnum
  justification?: string | null
  status: LIBAmendmentStatusEnum
  lineItemBudget: LineItemBudget
  proposedLineItemBudget: LineItemBudget
}

export type LIBAmendmentDetails = LIBAmendment & {}
