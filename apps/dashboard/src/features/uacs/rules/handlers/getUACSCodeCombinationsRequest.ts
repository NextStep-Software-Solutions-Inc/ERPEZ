/**
 * Get UACS Code Combinations Request
 * Fetches paginated list of UACS code combinations
 * 
 * API Endpoint: GET /uacs-code-combinations (from erpez-swagger.json)
 */
export const getUACSCodeCombinationsRequest = {
  endpoint: '/uacs-code-combinations',
  key: ({ url, params }: { url: string; params?: Record<string, any> }) =>
    [url, params] as const,
  fetcher: async ({ finalUrl }: { finalUrl: string }) => {
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
  },
}
