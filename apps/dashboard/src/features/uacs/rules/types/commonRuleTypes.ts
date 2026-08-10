/**
 * Rule Type Enumeration
 */
export enum RuleType {
  EXPENSE_MAPPING = 'EXPENSE_MAPPING',
  FISCAL_VALIDITY = 'FISCAL_VALIDITY',
  CODE_COMBINATION = 'CODE_COMBINATION',
}

/**
 * Rule Status
 */
export enum RuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

/**
 * Base interface for all validation rules
 */
export interface ValidationRuleBase {
  id: string
  name: string
  description?: string
  ruleType: RuleType
  status: RuleStatus
  priority: number
  errorMessage: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}
