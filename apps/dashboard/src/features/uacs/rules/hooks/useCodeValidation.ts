/**
 * useCodeValidation Hook
 * Provides real-time validation of code combinations against active rules
 */

import { useCallback } from 'react'
import { useAtomValue } from 'jotai'
import {
  validateCodeCombination,
  shouldBlockSubmission,
  getValidationSummary,
  type CodeData,
} from '../utils/CodeCombinationValidator'
import { codeRulesAtom } from '../atoms/codeRulesAtom'
import type { ValidationResult } from '../types/codeCombinationRuleTypes'

/**
 * Hook for validating code combinations against rules
 * Returns validation result and helper functions
 */
export function useCodeValidation() {
  const rules = useAtomValue(codeRulesAtom)

  /**
   * Validate provided code data against all active rules
   */
  const validate = useCallback(
    (codeData: CodeData): ValidationResult => {
      return validateCodeCombination(rules, codeData)
    },
    [rules]
  )

  /**
   * Check if validation has blocking errors
   */
  const hasBlockingErrors = useCallback(
    (validationResult: ValidationResult): boolean => {
      return shouldBlockSubmission(validationResult)
    },
    []
  )

  /**
   * Get human-readable summary of validation issues
   */
  const getSummary = useCallback(
    (validationResult: ValidationResult): string => {
      return getValidationSummary(validationResult)
    },
    []
  )

  /**
   * Get all error messages from validation result
   */
  const getErrorMessages = useCallback((validationResult: ValidationResult): string[] => {
    return validationResult.errors
  }, [])

  /**
   * Get all warning messages from validation result
   */
  const getWarningMessages = useCallback((validationResult: ValidationResult): string[] => {
    return validationResult.warnings
  }, [])

  return {
    validate,
    hasBlockingErrors,
    getSummary,
    getErrorMessages,
    getWarningMessages,
    totalRules: rules.length,
    activeRules: rules.filter((r) => r.isActive).length,
  }
}
