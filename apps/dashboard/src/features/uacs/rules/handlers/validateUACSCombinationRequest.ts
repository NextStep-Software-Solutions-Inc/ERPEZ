/**
 * Validate UACS Code Combination Request
 * Validates a UACS code combination against defined rules
 * 
 * API Endpoint: POST /uacs/validate-combination (from erpez-swagger.json)
 */

import { mockCodeCombinationRules } from '../../utils/mockData'
import type { Violation } from '../types/codeCombinationRuleTypes'

interface UACSCombinationData {
  [key: string]: { code: string }
}

export const validateUACSCombinationRequest = {
  endpoint: '/uacs/validate-combination',
  mutationFn: async (data: UACSCombinationData) => {
    // Mock implementation - validates against mock rules
    const violations: Violation[] = []
    const warnings: Violation[] = []

    // Filter active rules
    const activeRules = mockCodeCombinationRules.filter((r) => r.isActive)

    // Check each rule against the combination
    for (const rule of activeRules) {
      let ruleMatches = true

      // Check all conditions
      for (const condition of rule.conditions) {
        const codeValue = data[condition.codeSegment]?.code
        if (!codeValue) {
          ruleMatches = false
          break
        }

        // Validate based on condition type
        let conditionMet = false
        const condValue = Array.isArray(condition.value) ? condition.value : [condition.value]

        switch (condition.conditionType) {
          case 'equals':
            conditionMet = condValue.includes(codeValue)
            break
          case 'not_equals':
            conditionMet = !condValue.includes(codeValue)
            break
          case 'starts_with':
            conditionMet = condValue.some((v) => codeValue.startsWith(v))
            break
          case 'contains':
            conditionMet = condValue.some((v) => codeValue.includes(v))
            break
          case 'in_list':
            conditionMet = condValue.includes(codeValue)
            break
        }

        if (!conditionMet) {
          ruleMatches = false
          break
        }
      }

      // If all conditions matched, add violation or warning
      if (ruleMatches) {
        const violation: Violation = {
          ruleId: rule.id,
          ruleName: rule.name,
          message: rule.consequence.errorMessage,
          severity: rule.consequence.severity || (rule.consequence.action === 'block' ? 'error' : 'warning'),
        }

        if (rule.consequence.action === 'block') {
          violations.push(violation)
        } else if (rule.consequence.action === 'warn') {
          warnings.push(violation)
        }
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
    }
  },
}
