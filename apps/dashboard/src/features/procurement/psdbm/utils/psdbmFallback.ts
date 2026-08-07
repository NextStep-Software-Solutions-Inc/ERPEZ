/**
 * PSDBM Catalog Fallback Handler
 * 
 * Provides graceful fallback to mock data when:
 * - PSDBM API endpoint is unreachable
 * - Response parsing fails
 * - Network timeout occurs
 * - Backend proxy is not available
 * 
 * ✅ Production-safe: Mock data only used in development
 */

import type { PSDBMCatalogResponse, PSDBMItem, PSDBMCategory, PSDBMDepot } from '../types'
import { PSDBMItemAvailability, PSDBMCatalogMode } from '../types'

// Dev-only: Load mock data only in development mode
const getMockCatalogFunctions = async () => {
  if (!import.meta.env.DEV) {
    throw new Error('Mock data accessed in production')
  }
  return import('../mocks').then((m) => ({
    mockAPRCatalogItems: m.mockAPRCatalogItems,
    searchAPRCatalogItems: m.searchAPRCatalogItems,
    getAPRCatalogMockData: m.getAPRCatalogMockData,
  }))
}

/**
 * Fallback response structure when API fails
 * Matches PSDBMCatalogResponse interface - wrapped by response.data from API
 * ✅ Production-safe: Returns empty array in production
 */
export async function createFallbackCatalogResponse(
  options?: {
    search?: string
    limit?: number
    availability?: PSDBMItemAvailability
  }
): Promise<PSDBMCatalogResponse> {
  // ✅ Production-safe: Only use mock data in development
  if (!import.meta.env.DEV) {
    console.warn('[PSDBM] PSDBM Fallback not available in production')
    return {
      items: [],
      category: 'All',
      searchTerm: options?.search || '',
      mode: PSDBMCatalogMode.MAIN,
      totalItems: 0,
      isMockData: false,
    }
  }
  
  const { searchAPRCatalogItems, getAPRCatalogMockData } = await getMockCatalogFunctions()
  
  let items: PSDBMItem[] = []

  // If search query provided, search mock data
  if (options?.search && options.search.trim().length > 0) {
    items = searchAPRCatalogItems(options.search)
  } else {
    // Otherwise return all available by default
    items = getAPRCatalogMockData({
      availability: options?.availability || PSDBMItemAvailability.AVAILABLE,
      limit: options?.limit || 100,
    })
  }

  return {
    items,
    category: 'All',
    searchTerm: options?.search || '',
    mode: PSDBMCatalogMode.MAIN,
    totalItems: items.length,
    isMockData: true,
  }
}

/**
 * Create error response with fallback data
 * Logs the error but returns mock data instead of failing
 */
export async function handlePSDBMRequestError(
  error: Error | unknown,
  context?: {
    search?: string
    category?: string
    mode?: string
    apiPath?: string
  }
): Promise<PSDBMCatalogResponse> {
  console.warn('[PSDBM Fallback]', {
    message: 'PSDBM request failed, using mock data',
    error: error instanceof Error ? error.message : String(error),
    context,
    timestamp: new Date().toISOString(),
  })

  // Return fallback response
  return await createFallbackCatalogResponse({
    search: context?.search,
    availability: PSDBMItemAvailability.AVAILABLE,
  })
}

/**
 * Validate and parse PSDBM HTML response
 * Falls back to mock data if parsing fails
 */
export async function safeParsePSDBMResponse(
  htmlContent: string
): Promise<PSDBMCatalogResponse | null> {
  try {
    // If parsing succeeds, return null to indicate no fallback needed
    // (actual parsing happens in parseItemsFromHTML.ts)
    if (!htmlContent || htmlContent.trim().length === 0) {
      console.warn('[PSDBM Parser] Empty HTML content, using fallback')
      return await createFallbackCatalogResponse()
    }

    return null // No error, normal parsing
  } catch (error) {
    console.error('[PSDBM Parser] Failed to parse response:', error)
    return await createFallbackCatalogResponse()
  }
}

/**
 * Get mock data for specific item code (useful for detail views)
 * ✅ Dev-only: Loads mock data dynamically
 */
export async function getMockItemByCode(itemCode: string): Promise<PSDBMItem | undefined> {
  if (!import.meta.env.DEV) {
    return undefined
  }
  const { mockAPRCatalogItems } = await getMockCatalogFunctions()
  return mockAPRCatalogItems.find((item: PSDBMItem) => item.itemCode === itemCode)
}

/**
 * Get category-specific mock data
 * Useful for filtered catalog views
 * ✅ Dev-only: Loads mock data dynamically
 */
export async function getMockDataByCategory(
  category: 'OFFICE_SUPPLIES' | 'FURNITURE' | 'IT_EQUIPMENT' | 'CLEANING' | 'ALL' = 'ALL'
): Promise<PSDBMItem[]> {
  if (!import.meta.env.DEV) {
    return []
  }
  
  const { mockAPRCatalogItems } = await getMockCatalogFunctions()
  
  const categoryMappings: Record<string, string[]> = {
    OFFICE_SUPPLIES: [
      '44122105', // CLIP
      '44122104', // PAPER CLIP
      '31201512', // TAPE
      '14111507', // PAPER
      '44121708', // MARKER
      '60121524', // SIGN PEN
    ],
    FURNITURE: ['56101504', '47121702'], // MONOBLOC, WASTEBASKET
    IT_EQUIPMENT: ['13111201', '43211708', '44103103'], // CARBON FILM, MOUSE, TONER
    CLEANING: ['47131805', '47131830', '47131803', '47131602'], // CLEANSER, etc
  }

  if (category === 'ALL') {
    return mockAPRCatalogItems
  }

  const prefixes = categoryMappings[category] || []
  return mockAPRCatalogItems.filter((item: PSDBMItem) =>
    prefixes.some((prefix) => item.itemCode.startsWith(prefix))
  )
}

/**
 * Simulate delayed response (for testing)
 * Returns mock data after specified delay
 */
export async function getMockDataWithDelay(
  delayMs: number = 1000,
  options?: Parameters<typeof createFallbackCatalogResponse>[0]
): Promise<PSDBMCatalogResponse> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const data = await createFallbackCatalogResponse(options)
      resolve(data)
    }, delayMs)
  })
}

/**
 * Get mock categories for fallback
 * Returns standard PSDBM commodity categories
 */
export function getMockCategoriesFallback(): PSDBMCategory[] {
  const mockCategories: PSDBMCategory[] = [
    { id: 'OFFICE_SUPPLIES', name: 'Office Supplies', itemCount: 35 },
    { id: 'JANITORIAL', name: 'Janitorial & Sanitation Supplies', itemCount: 25 },
    { id: 'FURNITURE', name: 'Furniture & Fixtures', itemCount: 8 },
    { id: 'IT_EQUIPMENT', name: 'Information Technology Equipment', itemCount: 12 },
    { id: 'SAFETY', name: 'Safety Equipment & Supplies', itemCount: 18 },
    { id: 'ELECTRICAL', name: 'Electrical Supplies', itemCount: 15 },
    { id: 'PRINTING', name: 'Printing & Publishing', itemCount: 10 },
    { id: 'TOOLS', name: 'Tools & General Hardware', itemCount: 22 },
  ]

  return mockCategories
}

/**
 * Get mock depots for fallback
 * Returns standard PSDBM regional depots
 */
export function getMockDepotsFallback(): PSDBMDepot[] {
  const mockDepots: PSDBMDepot[] = [
    { id: 'NCR', name: 'NCR', region: 'National Capital Region' },
    { id: 'REGION_1', name: 'Region 1 - Ilocos', region: 'Ilocos Region' },
    { id: 'REGION_2', name: 'Region 2 - Cagayan Valley', region: 'Cagayan Valley' },
    { id: 'REGION_3', name: 'Region 3 - CALABARZON', region: 'CALABARZON' },
    { id: 'REGION_4B', name: 'Region 4B - MIMAROPA', region: 'Mimaropa' },
    { id: 'REGION_5', name: 'Region 5 - Bicol', region: 'Bicol Region' },
    { id: 'REGION_6', name: 'Region 6 - Western Visayas', region: 'Western Visayas' },
    { id: 'REGION_7', name: 'Region 7 - Central Visayas', region: 'Central Visayas' },
    { id: 'REGION_8', name: 'Region 8 - Eastern Visayas', region: 'Eastern Visayas' },
    { id: 'REGION_9', name: 'Region 9 - Zamboanga', region: 'Zamboanga Peninsula' },
    { id: 'REGION_10', name: 'Region 10 - Northern Mindanao', region: 'Northern Mindanao' },
    { id: 'REGION_11', name: 'Region 11 - Davao', region: 'Davao Region' },
    { id: 'REGION_12', name: 'Region 12 - Soccsksargen', region: 'Soccsksargen' },
    { id: 'CAR', name: 'CAR', region: 'Cordillera Administrative Region' },
    { id: 'ARMM', name: 'ARMM', region: 'Autonomous Region in Muslim Mindanao' },
  ]

  return mockDepots
}
