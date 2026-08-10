/**
 * Create UACS Validation Rule Request
 * Creates a new UACS validation rule
 * 
 * API Endpoint: POST /uacs-validation-rules (from erpez-swagger.json)
 */
import type { CodeCombinationRule } from '../types/codeCombinationRuleTypes'

export const createUACSValidationRuleRequest = {
  endpoint: '/uacs-validation-rules',
  mutationFn: async (data: CodeCombinationRule) => {
    // Placeholder - will use actual API client
    // return (await api.post('/uacs-validation-rules', data)).data
    return data
  },
}
