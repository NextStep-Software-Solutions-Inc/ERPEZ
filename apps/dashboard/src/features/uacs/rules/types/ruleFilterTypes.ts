import type { RuleType, RuleStatus } from './commonRuleTypes'

/**
 * Filter options for rules
 */
export interface RuleFilters {
  ruleType?: RuleType
  status?: RuleStatus
  searchTerm?: string
}
