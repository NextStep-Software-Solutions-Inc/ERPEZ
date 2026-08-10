/**
 * Code Combination Rule Types
 * Defines validation rules for combinations of UACS code segments
 */

export type RuleConditionType = 'equals' | 'not_equals' | 'starts_with' | 'contains' | 'in_list'
export type RuleAction = 'block' | 'warn'

export interface RuleCondition {
  codeSegment: 'fundingSource' | 'organization' | 'location' | 'mfoPap' | 'objectCode'
  conditionType: RuleConditionType
  value: string | string[]
  field?: string // e.g., 'code', 'name', 'expenseClass'
}

export interface RuleConsequence {
  action: RuleAction
  errorMessage: string
  severity?: 'error' | 'warning'
}

export interface CodeCombinationRule {
  id: string
  name: string
  description: string
  conditions: RuleCondition[]
  consequence: RuleConsequence
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface Violation {
  ruleId: string
  ruleName: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  errors: Violation[]
  warnings: Violation[]
}
