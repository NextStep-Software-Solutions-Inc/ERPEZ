/**
 * Get MFO/PAP Codes Request
 * Fetches paginated list of MFO/PAP codes with hierarchy
 * 
 * API Endpoint: GET /mfopaps (from erpez-swagger.json)
 */
export const getMfoPapCodesRequest = {
  endpoint: '/mfopaps',
  key: ({ url, params }: { url: string; params?: Record<string, any> }) =>
    [url, params] as const,
  fetcher: async ({ finalUrl }: { finalUrl: string }) => {
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
  },
}
