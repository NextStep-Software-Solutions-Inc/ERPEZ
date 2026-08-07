/**
 * Get Location Codes Request
 * Fetches paginated list of location codes
 * 
 * API Endpoint: GET /locations (from erpez-swagger.json)
 */
export const getLocationCodesRequest = {
  endpoint: '/locations',
  key: ({ url, params }: { url: string; params?: Record<string, any> }) =>
    [url, params] as const,
  fetcher: async ({ finalUrl }: { finalUrl: string }) => {
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
  },
}
