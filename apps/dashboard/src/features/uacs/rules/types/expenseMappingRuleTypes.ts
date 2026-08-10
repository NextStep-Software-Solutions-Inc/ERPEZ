import type { ExpenseClass } from '../../code-segments/types/commonTypes'
import type { ValidationRuleBase, RuleType } from './commonRuleTypes'

/**
 * Expense Class Mapping Rule
 * Auto-maps Object Codes to their Expense Class based on account group
 */
export interface ExpenseMappingRule extends ValidationRuleBase {
  ruleType: RuleType.EXPENSE_MAPPING
  accountGroupPrefix: string // e.g., "501", "502", "106"
  expenseClass: ExpenseClass
  allowOverride: boolean
}
