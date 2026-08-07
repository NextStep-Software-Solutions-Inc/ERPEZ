import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { PPMPItem } from '../types'
import { getMockPPMPs, getMockPPMPSummaries } from '../__mocks__/ppmpMocks'

/**
 * Get All PPMPs Request Handler
 *
 * Fetches all PPMPs available for consolidation into APP
 * Uses mock data for development
 */
export const getPPMPsRequest = {
  endpoint: '/ppmps',
  key: ({ url }) => [url] as const,
  fetcher: async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const ppmps = getMockPPMPs()

    return {
      data: ppmps,
      pagination: {
        total: ppmps.length,
        page: 1,
        pageSize: 100,
        totalPages: 1,
      },
    }
  },
} as const satisfies QueryBlueprintFromTemplate<
  '/ppmps',
  {
    data: PPMPItem[]
    pagination: {
      total: number
      page: number
      pageSize: number
      totalPages: number
    }
  },
  unknown,
  readonly [string]
>

/**
 * Get PPMP Summaries Request Handler
 *
 * Fetches summarized PPMP data (one entry per PPMP with item counts and budgets)
 * Useful for selection grids and dashboard views
 */
export const getPPMPSummariesRequest = {
  endpoint: '/ppmps/summaries',
  key: ({ url }) => [url] as const,
  fetcher: async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const summaries = getMockPPMPSummaries()

    return {
      data: summaries,
      pagination: {
        total: summaries.length,
        page: 1,
        pageSize: 100,
        totalPages: 1,
      },
    }
  },
} as const satisfies QueryBlueprintFromTemplate<
  '/ppmps/summaries',
  {
    data: ReturnType<typeof getMockPPMPSummaries>
    pagination: {
      total: number
      page: number
      pageSize: number
      totalPages: number
    }
  },
  unknown,
  readonly [string]
>

/**
 * Get PPMP by Status Request Handler
 *
 * Fetches PPMPs filtered by approval status
 */
export const getPPMPsByStatusRequest = {
  endpoint: '/ppmps/by-status',
  key: ({ url }) => [url] as const,
  fetcher: async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Return all PPMPs - filtering by status should be done on client side or via query params
    const ppmps = getMockPPMPs()

    return {
      data: ppmps,
      pagination: {
        total: ppmps.length,
        page: 1,
        pageSize: 100,
        totalPages: 1,
      },
    }
  },
} as const satisfies QueryBlueprintFromTemplate<
  '/ppmps/by-status',
  {
    data: PPMPItem[]
    pagination: {
      total: number
      page: number
      pageSize: number
      totalPages: number
    }
  },
  unknown,
  readonly [string]
>
