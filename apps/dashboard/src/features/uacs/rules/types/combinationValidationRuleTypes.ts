import type { ValidationRuleBase, RuleType } from './commonRuleTypes'

/**
 * Code Combination Operator
 */
export enum CombinationOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  CONTAINS = 'CONTAINS',
}

/**
 * Code Combination Condition
 */
export interface CombinationCondition {
  field: string // e.g., "fundingSource", "objectCode"
  operator: CombinationOperator
  value: string
}

/**
 * Code Combination Validation Rule
 * Defines valid/invalid combinations of UACS codes
 */
export interface CombinationValidationRule extends ValidationRuleBase {
  ruleType: RuleType.CODE_COMBINATION
  conditions: CombinationCondition[]
  isAllowed: boolean // true = allow combination, false = reject combination
}
