import api from '@/services/api'

/**
 * Positions Statistics API Response
 */
export interface PositionsStatisticsResponse {
  totalPositions: number
  totalActiveIncumbents: number
  vacancyVariance: number
  filledPositions: number
  vacantPositions: number
  abolishedPositions: number
}

export interface PositionsStatisticsApiPayload {
  succeeded: boolean
  message: string | null
  data: PositionsStatisticsResponse
  errors: string[] | null
}

/**
 * Fetch positions statistics from the API
 * Endpoint: GET /positions/statistics
 * 
 * Returns KPI metrics for organizational positions:
 * - totalPositions: Total number of positions in the organization
 * - totalActiveIncumbents: Total active employees/incumbents
 * - vacancyVariance: Percentage of vacant positions
 * - filledPositions: Number of filled positions
 * - vacantPositions: Number of vacant positions
 * - abolishedPositions: Number of abolished positions
 */
export async function fetchPositionsStatistics(): Promise<PositionsStatisticsResponse> {
  try {
    // token header is injected via axios interceptor (see config/axios.config.ts)
    const response = await api.get<PositionsStatisticsApiPayload>('/positions/statistics')

    if (response.data && response.data.succeeded && response.data.data) {
      return response.data.data
    }

    // Return default values if data is not available
    return {
      totalPositions: 0,
      totalActiveIncumbents: 0,
      vacancyVariance: 0,
      filledPositions: 0,
      vacantPositions: 0,
      abolishedPositions: 0,
    }
  } catch (error) {
    console.error('Failed to fetch positions statistics from API:', error)
    throw error
  }
}
