/**
 * Get Object Codes Request
 * Fetches paginated list of object codes with expense class
 * 
 * API Endpoint: GET /objects (from erpez-swagger.json)
 */

import { mockObjectCodes } from '../../utils/mockData'

export const getObjectCodesRequest = {
  endpoint: '/objects',
  key: ({ url, params }: { url: string; params?: Record<string, any> }) =>
    [url, params] as const,
  fetcher: async ({ finalUrl: _finalUrl }: { finalUrl: string }) => {
    // Mock implementation - returns paginated mock data
    // TODO: Use _finalUrl when switching to real API: const response = await api.get(_finalUrl)
    const page = 1
    const limit = 20
    const total = mockObjectCodes.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const paginatedData = mockObjectCodes.slice(start, start + limit)

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    }
  },
}
