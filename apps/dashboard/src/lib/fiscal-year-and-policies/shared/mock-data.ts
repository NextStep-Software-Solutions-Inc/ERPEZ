/**
 * Mock/Seed data for Fiscal Year & Policies
 * Used in development mode with VITE_USE_MOCK=true
 */

import type {
  FiscalYear,
  EconomicIndicator,
  BudgetCall,
  ProcurementThreshold,
  RatingScale,
} from './index'
import {
  FiscalYearStatus,
  BudgetCallStatus,
  ProcurementMethodType,
  RatingScale as RatingScaleEnum,
} from './index'

// ============================================
// FISCAL YEAR DATA
// ============================================

export const mockFiscalYears: FiscalYear[] = [
  {
    id: 'fy-2024',
    yearNumber: 2024,
    description: 'Fiscal Year 2024 - Active',
    status: FiscalYearStatus.ACTIVE,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isLocked: false,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'fy-2025',
    yearNumber: 2025,
    description: 'Fiscal Year 2025 - Planning',
    status: FiscalYearStatus.INACTIVE,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isLocked: false,
    isArchived: false,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'fy-2023',
    yearNumber: 2023,
    description: 'Fiscal Year 2023 - Closed',
    status: FiscalYearStatus.ARCHIVED,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    isLocked: true,
    isArchived: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

// ============================================
// ECONOMIC INDICATOR DATA
// ============================================

export const mockEconomicIndicators: EconomicIndicator[] = [
  {
    id: 'econ-1',
    fiscalYearId: 'fy-2024',
    code: 'GDP',
    name: 'Gross Domestic Product',
    value: 2500000,
    unit: 'USD',
    trend: 'up',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'econ-2',
    fiscalYearId: 'fy-2024',
    code: 'INFLATION',
    name: 'Inflation Rate',
    value: 3.5,
    unit: '%',
    trend: 'stable',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'econ-3',
    fiscalYearId: 'fy-2024',
    code: 'UNEMPLOYMENT',
    name: 'Unemployment Rate',
    value: 5.2,
    unit: '%',
    trend: 'down',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
]

// ============================================
// BUDGET CALL DATA
// ============================================

export const mockBudgetCalls: BudgetCall[] = [
  {
    id: 'bc-1',
    fiscalYearId: 'fy-2024',
    name: 'Initial Budget Call FY2024',
    description: 'First round of budget submissions',
    status: BudgetCallStatus.CLOSED,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    order: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-16T00:00:00Z',
  },
  {
    id: 'bc-2',
    fiscalYearId: 'fy-2024',
    name: 'Supplementary Budget Call FY2024',
    description: 'Second round for revisions',
    status: BudgetCallStatus.OPEN,
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    parentBudgetCallId: 'bc-1',
    order: 2,
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z',
  },
]

// ============================================
// PROCUREMENT THRESHOLD DATA
// ============================================

export const mockProcurementThresholds: ProcurementThreshold[] = [
  {
    id: 'pt-1',
    fiscalYearId: 'fy-2024',
    code: 'PT001',
    name: 'Small Value Procurement',
    method: ProcurementMethodType.OPEN_BIDDING,
    minAmount: 0,
    maxAmount: 50000,
    order: 1,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pt-2',
    fiscalYearId: 'fy-2024',
    code: 'PT002',
    name: 'Medium Value Procurement',
    method: ProcurementMethodType.LIMITED_BIDDING,
    minAmount: 50000,
    maxAmount: 500000,
    order: 2,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pt-3',
    fiscalYearId: 'fy-2024',
    code: 'PT003',
    name: 'Large Value Procurement',
    method: ProcurementMethodType.NEGOTIATED_PROCUREMENT,
    minAmount: 500000,
    order: 3,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

// ============================================
// RATING SCALE DATA
// ============================================

export const mockRatingScales: RatingScale[] = [
  {
    id: 'rs-1',
    fiscalYearId: 'fy-2024',
    name: 'General Performance Scale',
    code: 'GPS-FY2024',
    description: 'Standard 5-point performance rating scale',
    type: 'general',
    scaleType: 'fixed',
    ratings: [
      {
        rating: 5,
        description: 'Excellent - Exceeds all expectations and targets',
        minValue: 90,
        maxValue: 100,
      },
      {
        rating: 4,
        description: 'Very Good - Exceeds most targets',
        minValue: 80,
        maxValue: 89.9,
      },
      {
        rating: 3,
        description: 'Satisfactory - Meets all targets',
        minValue: 70,
        maxValue: 79.9,
      },
      {
        rating: 2,
        description: 'Below Average - Meets some targets',
        minValue: 60,
        maxValue: 69.9,
      },
      {
        rating: 1,
        description: 'Poor - Does not meet targets',
        minValue: 0,
        maxValue: 59.9,
      },
    ],
    applicableToQET: ['quantity', 'efficiency', 'timeliness'],
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

// ============================================
// PAGINATED RESPONSE HELPERS
// ============================================

export const createMockPaginatedResponse = <T>(
  items: T[],
  page = 1,
  pageSize = 10,
) => {
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedItems = items.slice(start, end)

  return {
    data: paginatedItems,
    meta: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }
}
