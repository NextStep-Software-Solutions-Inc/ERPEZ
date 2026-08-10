import type { ValidationRuleBase, RuleType } from './commonRuleTypes'

/**
 * Fiscal Year Validity Rule
 * Defines which codes are valid for specific fiscal years
 */
export interface FiscalValidityRule extends ValidationRuleBase {
  ruleType: RuleType.FISCAL_VALIDITY
  codeSegmentId: string
  codeSegmentType: string
  fiscalYearStart: number
  fiscalYearEnd?: number
  isActive: boolean
}
