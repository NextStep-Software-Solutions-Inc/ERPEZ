/**
 * Get Organization Codes Request
 * Fetches paginated list of organization codes
 * 
 * API Endpoint: GET /organizations (from erpez-swagger.json)
 */
export const getOrganizationCodesRequest = {
  endpoint: '/organizations',
  key: ({ url, params }: { url: string; params?: Record<string, any> }) =>
    [url, params] as const,
  fetcher: async ({ finalUrl, signal }: { finalUrl: string; signal?: AbortSignal }) => {
    // the API returns the same generic paginated envelope shown in the request
    const resp = await api.get<{
      succeeded: boolean
      message: string | null
      data: Array<{ id: string; parentId: string | null; name: string; code: string; type: string; isActive: boolean }>
      pageNumber: number
      pageSize: number
      totalPages: number
      totalCount: number
    }>(finalUrl, { signal })
    return resp.data
  },
}
