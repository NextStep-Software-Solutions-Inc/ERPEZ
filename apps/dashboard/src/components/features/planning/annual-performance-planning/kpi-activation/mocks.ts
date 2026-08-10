/**
 * Mock data for KPI Activation
 * Used for development and testing
 * 
 * To enable mocks:
 * 1. Set USE_MOCK_DATA to true in this file
 * 2. Or set VITE_USE_MOCK_KPIS=true in .env or .env.local
 */

// Type definitions for mock data
interface MockKPI {
  id: string
  code: string
  name: string
  description: string
  isAvailableForShopping: boolean
  category: string
  unit: string
  targetValue: number
}

interface MockKPIResponse {
  data: MockKPI[]
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Check environment variable first, then fallback to explicit flag
export const USE_MOCK_DATA = 
  import.meta.env.VITE_USE_MOCK_KPIS === 'true' || 
  localStorage.getItem('app_use_mock_kpis') === 'true' ||
  false // Set to true to enable mocks by default

export const MOCK_AVAILABLE_KPIS: MockKPIResponse = {
  data: [
    {
      id: 'kpi-001',
      code: 'KPI001',
      name: 'Revenue Growth',
      description: 'Measure year-over-year revenue increase',
      isAvailableForShopping: false,
      category: 'Financial',
      unit: 'Percentage',
      targetValue: 15,
    },
    {
      id: 'kpi-002',
      code: 'KPI002',
      name: 'Customer Satisfaction',
      description: 'Net Promoter Score from customer surveys',
      isAvailableForShopping: true,
      category: 'Customer',
      unit: 'Score',
      targetValue: 75,
    },
    {
      id: 'kpi-003',
      code: 'KPI003',
      name: 'Employee Retention',
      description: 'Percentage of employees retained',
      isAvailableForShopping: true,
      category: 'People',
      unit: 'Percentage',
      targetValue: 92,
    },
    {
      id: 'kpi-004',
      code: 'KPI004',
      name: 'Product Quality',
      description: 'Defect rate per 1000 units',
      isAvailableForShopping: false,
      category: 'Operations',
      unit: 'Rate',
      targetValue: 5,
    },
    {
      id: 'kpi-005',
      code: 'KPI005',
      name: 'Market Share',
      description: 'Percentage of total market controlled',
      isAvailableForShopping: false,
      category: 'Market',
      unit: 'Percentage',
      targetValue: 25,
    },
    {
      id: 'kpi-006',
      code: 'KPI006',
      name: 'Project Delivery Time',
      description: 'Average days to complete projects',
      isAvailableForShopping: true,
      category: 'Operations',
      unit: 'Days',
      targetValue: 30,
    },
    {
      id: 'kpi-007',
      code: 'KPI007',
      name: 'Cost Efficiency',
      description: 'Operating cost as percentage of revenue',
      isAvailableForShopping: false,
      category: 'Financial',
      unit: 'Percentage',
      targetValue: 35,
    },
    {
      id: 'kpi-008',
      code: 'KPI008',
      name: 'Innovation Index',
      description: 'Number of new products launched',
      isAvailableForShopping: true,
      category: 'Innovation',
      unit: 'Count',
      targetValue: 8,
    },
  ],
  pagination: {
    page: 1,
    pageSize: 50,
    total: 8,
    totalPages: 1,
  },
}

export const MOCK_ACTIVATED_KPIS = [
  {
    id: 'activated-001',
    kpiId: 'kpi-001',
    kpiName: 'Revenue Growth',
    activationType: 'Mandated' as const,
    status: 'Active',
    createdAt: new Date().toISOString(),
    fiscalYearId: 'fy-2026',
    functionType: 'CoreFunction' as const,
    isLocked: false,
    allowOfficeOverride: true,
    aggregationMethod: 'SUM' as const,
  },
  {
    id: 'activated-002',
    kpiId: 'kpi-004',
    kpiName: 'Product Quality',
    activationType: 'Mandated' as const,
    status: 'Active',
    createdAt: new Date().toISOString(),
    fiscalYearId: 'fy-2026',
    functionType: 'CoreFunction' as const,
    isLocked: false,
    allowOfficeOverride: true,
    aggregationMethod: 'SUM' as const,
  },
]

/**
 * Helper to toggle mock data in browser DevTools console:
 * localStorage.setItem('app_use_mock_kpis', 'true')
 * localStorage.removeItem('app_use_mock_kpis')
 * Then refresh the page
 */
export const enableMockData = () => {
  localStorage.setItem('app_use_mock_kpis', 'true')
  window.location.reload()
}

export const disableMockData = () => {
  localStorage.removeItem('app_use_mock_kpis')
  window.location.reload()
}

/**
 * Create activated KPIs from selected KPI IDs
 * Used for mock activation
 */
import type { ActivatedKPI } from '@/features/planning/annual-performance-planning/appTypes'

export const createActivatedKPIs = (selectedKPIIds: string[], _activationType: 'Mandated' | 'AvailableForShopping', fiscalYearId: string = 'fy-temp'): ActivatedKPI[] => {
  return selectedKPIIds.map((kpiId, index) => {
    const kpi = MOCK_AVAILABLE_KPIS.data.find((k: any) => k.id === kpiId)
    const isAvailableForShopping = kpi?.isAvailableForShopping ?? false
    return {
      id: `activated-${Date.now()}-${index}`,
      fiscalYearId,
      kpiId,
      kpiName: kpi?.name || 'Unknown KPI',
      kpiCode: kpi?.code,
      description: kpi?.description,
      functionType: 'CoreFunction' as const,
      activationType: isAvailableForShopping ? 'AvailableForShopping' : 'Mandated',
      isLocked: false,
      assignedBy: 'system',
      assignedAt: new Date().toISOString(),
      allowOfficeOverride: isAvailableForShopping,
    } as ActivatedKPI
  })
}
