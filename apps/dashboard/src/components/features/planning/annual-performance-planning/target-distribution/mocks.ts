/**
 * Mock data for Target Distribution
 * Used for development and testing
 * 
 * To enable mocks:
 * 1. Set USE_MOCK_DATA to true in this file
 * 2. Or set VITE_USE_MOCK_TARGETS=true in .env or .env.local
 */

import type { PaginationResponse } from 'erpez-shared-lib'
import type { KPITarget } from '@/features/planning/annual-performance-planning/appTypes'

// Check environment variable first, then fallback to explicit flag
export const USE_MOCK_DATA = 
  import.meta.env.VITE_USE_MOCK_TARGETS === 'true' || 
  localStorage.getItem('app_use_mock_targets') === 'true' ||
  false // Set to true to enable mocks by default

export const MOCK_KPI_TARGETS: PaginationResponse<KPITarget> = {
  data: [
    {
      id: 'target-001',
      fiscalYearId: 'fy-2024',
      activatedKPIId: 'akpi-001',
      deliveryUnitId: 'du-001',
      targetValue: 15,
      isLockedByPlanning: false,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'target-002',
      fiscalYearId: 'fy-2024',
      activatedKPIId: 'akpi-001',
      deliveryUnitId: 'du-002',
      targetValue: 12,
      isLockedByPlanning: false,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'target-003',
      fiscalYearId: 'fy-2024',
      activatedKPIId: 'akpi-007',
      deliveryUnitId: 'du-001',
      targetValue: 35,
      isLockedByPlanning: false,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'target-004',
      fiscalYearId: 'fy-2024',
      activatedKPIId: 'akpi-007',
      deliveryUnitId: 'du-002',
      targetValue: 32,
      isLockedByPlanning: false,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'target-005',
      fiscalYearId: 'fy-2024',
      activatedKPIId: 'akpi-007',
      deliveryUnitId: 'du-003',
      targetValue: 38,
      isLockedByPlanning: false,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  succeeded: true,
  message: 'Mock KPI targets retrieved successfully',
  errors: {},
  pageSize: 50,
  pageNumber: 1,
  totalPageNumber: 1,
  loadMore: false,
  totalRows: 5,
}

/**
 * Helper to toggle mock data in browser DevTools console:
 * localStorage.setItem('app_use_mock_targets', 'true')
 * localStorage.removeItem('app_use_mock_targets')
 * Then refresh the page
 */
export const enableMockData = () => {
  localStorage.setItem('app_use_mock_targets', 'true')
  window.location.reload()
}

export const disableMockData = () => {
  localStorage.removeItem('app_use_mock_targets')
  window.location.reload()
}

/**
 * Create/update mock targets
 * Used for mock target updates
 */
export const updateMockTargets = (targets: KPITarget[]): PaginationResponse<KPITarget> => {
  return {
    data: targets,
    succeeded: true,
    message: 'Mock targets updated successfully',
    errors: {},
    pageSize: 50,
    pageNumber: 1,
    totalPageNumber: 1,
    loadMore: false,
    totalRows: targets.length,
  }
}
