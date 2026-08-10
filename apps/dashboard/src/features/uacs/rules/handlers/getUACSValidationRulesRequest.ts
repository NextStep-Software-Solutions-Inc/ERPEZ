/**
 * Get UACS Validation Rules Request
 * Fetches paginated list of UACS validation rules
 * 
 * API Endpoint: GET /uacs-validation-rules (from erpez-swagger.json)
 */

import { mockCodeCombinationRules } from '../../utils/mockData'

export const getUACSValidationRulesRequest = {
  endpoint: '/uacs-validation-rules',
  key: ({ url, params }: { url: string; params?: Record<string, any> }) =>
    [url, params] as const,
  fetcher: async ({ finalUrl: _finalUrl }: { finalUrl: string }) => {
    // Mock implementation - returns paginated mock data
    // TODO: Use _finalUrl when switching to real API: const response = await api.get(_finalUrl)
    const page = 1
    const limit = 10
    const total = mockCodeCombinationRules.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const paginatedData = mockCodeCombinationRules.slice(start, start + limit)

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    }
  },
}
