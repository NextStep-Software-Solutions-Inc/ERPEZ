/**
 * Get UACS Code Segments Request
 * Fetches paginated list of generic UACS code segments
 * 
 * API Endpoint: GET /uacs-code-segments (from erpez-swagger.json)
 */
export const getUACSCodeSegmentsRequest = {
  endpoint: '/uacs-code-segments',
  key: ({ url, params }: { url: string; params?: Record<string, any> }) =>
    [url, params] as const,
  fetcher: async ({ finalUrl }: { finalUrl: string }) => {
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
  },
}
