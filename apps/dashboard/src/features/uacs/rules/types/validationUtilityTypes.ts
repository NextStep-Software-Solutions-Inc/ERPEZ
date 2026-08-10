import type { ExpenseMappingRule } from './expenseMappingRuleTypes'
import type { FiscalValidityRule } from './fiscalValidityRuleTypes'
import type { CombinationValidationRule } from './combinationValidationRuleTypes'

/**
 * Rule Type Union
 */
export type ValidationRule =
  | ExpenseMappingRule
  | FiscalValidityRule
  | CombinationValidationRule

/**
 * Rule Evaluation Result
 */
export interface RuleEvaluationResult {
  isValid: boolean
  violatedRules: ValidationRule[]
  errorMessages: string[]
}

/**
 * Rule Test Input
 * Used to test rules against sample data
 */
export interface RuleTestInput {
  fundingSource?: string
  organizationCode?: string
  locationCode?: string
  mfoPap?: string
  objectCode?: string
  fiscalYear: number
}
