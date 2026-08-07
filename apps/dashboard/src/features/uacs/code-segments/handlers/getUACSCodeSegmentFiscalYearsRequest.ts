/**
 * Get UACS Code Segment Fiscal Years Request
 * Fetches fiscal year validity for code segments
 * 
 * API Endpoint: GET /uacs-code-segment-fiscal-years (from erpez-swagger.json)
 */
export const getUACSCodeSegmentFiscalYearsRequest = {
  endpoint: '/uacs-code-segment-fiscal-years',
  key: ({ url, params }: { url: string; params?: Record<string, any> }) =>
    [url, params] as const,
  fetcher: async ({ finalUrl }: { finalUrl: string }) => {
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
  },
}
