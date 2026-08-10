/**
 * Code Combination Validator
 * Evaluates code combination rules against provided code data
 * Supports block (error) and warn (warning) actions
 */

import type { CodeCombinationRule, RuleCondition, ValidationResult, Violation } from '../types/codeCombinationRuleTypes'
import type { FundingSource } from '../../code-segments/types/fundingSourceTypes'
import type { LocationCode } from '../../code-segments/types/locationCodeTypes'
import type { MfoPap } from '../../code-segments/types/mfoPapTypes'
import type { ObjectCode } from '../../code-segments/types/objectCodeTypes'
import type { OrganizationCode } from '../../code-segments/types/organizationCodeTypes'

export type CodeData = {
  fundingSource?: FundingSource
  organization?: OrganizationCode
  location?: LocationCode
  mfoPap?: MfoPap
  objectCode?: ObjectCode
}

/**
 * Evaluates a single condition against code data
 */
function evaluateCondition(condition: RuleCondition, codeData: CodeData): boolean {
  const segmentData = codeData[condition.codeSegment as keyof CodeData]
  if (!segmentData) return false

  const fieldValue = condition.field ? (segmentData as unknown as Record<string, unknown>)[condition.field] : (segmentData as unknown as Record<string, unknown>).code

  if (!fieldValue) return false

  const valueStr = String(fieldValue).trim()

  switch (condition.conditionType) {
    case 'equals':
      return valueStr === String(condition.value).trim()

    case 'not_equals':
      return valueStr !== String(condition.value).trim()

    case 'starts_with':
      return valueStr.startsWith(String(condition.value).trim())

    case 'contains':
      return valueStr.includes(String(condition.value).trim())

    case 'in_list':
      if (Array.isArray(condition.value)) {
        return condition.value.some((v) => valueStr === String(v).trim())
      }
      return false

    default:
      return false
  }
}

/**
 * Evaluates all conditions in a rule (AND logic - all must pass)
 */
function evaluateRule(rule: CodeCombinationRule, codeData: CodeData): boolean {
  if (!rule.isActive) return false // Inactive rules never violate

  // All conditions must be true (AND logic)
  return rule.conditions.every((condition) => evaluateCondition(condition, codeData))
}

/**
 * Validates code data against all rules
 * Returns validation result with errors and warnings
 */
export function validateCodeCombination(rules: CodeCombinationRule[], codeData: CodeData): ValidationResult {
  const errors: Violation[] = []
  const warnings: Violation[] = []

  for (const rule of rules) {
    // Check if any condition matches
    const ruleViolated = evaluateRule(rule, codeData)

    if (ruleViolated) {
      const violation: Violation = {
        ruleId: rule.id,
        ruleName: rule.name,
        message: rule.consequence.errorMessage,
        severity: rule.consequence.severity || (rule.consequence.action === 'block' ? 'error' : 'warning'),
      }

      if (rule.consequence.action === 'block') {
        errors.push(violation)
      } else if (rule.consequence.action === 'warn') {
        warnings.push(violation)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Check if validation should block submission (has errors)
 */
export function shouldBlockSubmission(validationResult: ValidationResult): boolean {
  return validationResult.errors.length > 0
}

/**
 * Get human-readable validation summary
 */
export function getValidationSummary(validationResult: ValidationResult): string {
  if (validationResult.isValid && validationResult.warnings.length === 0) {
    return 'Code combination is valid'
  }

  const parts: string[] = []

  if (validationResult.errors.length > 0) {
    parts.push(`${validationResult.errors.length} error(s)`)
  }

  if (validationResult.warnings.length > 0) {
    parts.push(`${validationResult.warnings.length} warning(s)`)
  }

  return parts.join(' and ')
}
