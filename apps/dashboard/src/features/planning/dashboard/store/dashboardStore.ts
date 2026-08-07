/**
 * Planning Dashboard Store
 * 
 * Zustand store for Planning Dashboard state management with mock data.
 * Follows RFQ module pattern with client-side state and comprehensive seed data.
 * 
 * @module features/planning/dashboard/store/dashboardStore
 */

import { create } from 'zustand'
import type {
  DashboardState,
  DashboardSummary,
  OPCRChartData,
  MFOStatusData,
  BudgetHeatmapData,
  KPIHealthData,
  PPMPConsolidationData,
  SmartTaskCard,
  Department,
  UACSObligationData,
  AppProcurementReadinessData,
  GAAUtilizationData,
  KPIClassificationData,
} from '../types'

// ============================================================================
// Mock Data Generators
// ============================================================================

/**
 * Generate mock dashboard summary data with realistic Philippine government figures
 */
function generateMockSummary(): DashboardSummary {
  return {
    totalKPIsEncoded: 342,
    opcrSubmittedPercent: 87.5,
    budgetUtilized: 124_500_000, // ₱124.5M
    ppmpConsolidationPercent: 73.2,
    kpiChangeFromLastMonth: 12,
    opcrChangeFromLastMonth: 5.3,
    budgetChangeFromLastMonth: -2.1,
    ppmpChangeFromLastMonth: 8.7,
  }
}

/**
 * Generate mock OPCR Planned vs Actual chart data (12 months)
 */
function generateMockOPCRChartData(): OPCRChartData {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  // Static variance per month — deterministic so charts don't flicker on re-render
  const variance = [6.2, 4.8, 9.1, 7.5, 5.3, 11.2, 8.4, 3.9, 10.7, 6.1, 7.8, 4.5]

  return months.map((month, index) => {
    const planned = Math.min(95, 60 + index * 3)
    const actual = Math.max(0, planned - variance[index])
    return {
      month,
      planned: Number(planned.toFixed(1)),
      actual: Number(actual.toFixed(1)),
    }
  })
}

/**
 * Generate mock MFO status data
 */
function generateMockMFOStatusData(): MFOStatusData[] {
  return [
    {
      category: 'Q1',
      completed: 45,
      ongoing: 23,
      pending: 8,
    },
    {
      category: 'Q2',
      completed: 52,
      ongoing: 19,
      pending: 12,
    },
    {
      category: 'Q3',
      completed: 38,
      ongoing: 28,
      pending: 15,
    },
    {
      category: 'Q4',
      completed: 29,
      ongoing: 35,
      pending: 24,
    },
  ]
}

/**
 * Generate mock budget utilization heatmap data
 */
function generateMockBudgetHeatmapData(): BudgetHeatmapData {
  const departments = [
    'Office of the Mayor',
    'City Planning & Development',
    'City Budget Office',
    'City Treasurer',
    'City Engineering',
  ]

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const data: BudgetHeatmapData = []

  // Static variance per month — deterministic so charts don't flicker on re-render
  const monthlyVariance = [3.1, 8.4, 5.2, 11.7, 6.9, 2.3, 9.8, 4.5, 12.1, 7.6, 3.8, 10.2]

  departments.forEach((department) => {
    months.forEach((month, index) => {
      const baseUtilization = (index + 1) * 7 + monthlyVariance[index]
      data.push({
        department,
        month,
        utilizationPercent: Math.min(95, Number(baseUtilization.toFixed(1))),
      })
    })
  })

  return data
}

/**
 * Generate mock KPI health data
 */
function generateMockKPIHealthData(): KPIHealthData {
  return [
    { status: 'Active', count: 245, color: '#10b981' }, // green
    { status: 'Validated', count: 67, color: '#3b82f6' }, // blue
    { status: 'Pending', count: 23, color: '#f59e0b' }, // yellow/orange
    { status: 'Inactive', count: 7, color: '#ef4444' }, // red
  ]
}

/**
 * Generate mock PPMP consolidation data
 */
function generateMockPPMPConsolidationData(): PPMPConsolidationData {
  return [
    { status: 'Consolidated', count: 156, color: '#10b981' }, // green
    { status: 'In Progress', count: 89, color: '#3b82f6' }, // blue
    { status: 'Pending', count: 42, color: '#f59e0b' }, // orange
  ]
}

/**
 * Generate mock Smart Task Cards with various types
 */
function generateMockTasks(): SmartTaskCard[] {
  return [
    // OPCR Task
    {
      id: 'task-001',
      title: 'Review OPCR Q2 Commitment - City Planning',
      description:
        'Approve quarterly commitment submission for City Planning & Development Office',
      dueDate: '2026-04-25T17:00:00Z',
      priority: 'high',
      type: 'OPCR',
      status: 'pending',
      actionLabel: 'Review & Approve',
      metadata: {
        type: 'OPCR',
        commitmentId: 'opcr-q2-cpdo-2026',
        plannedCompletion: 85,
        actualCompletion: 78,
        chartData: [
          { month: 'Feb', planned: 75, actual: 72 },
          { month: 'Mar', planned: 80, actual: 75 },
          { month: 'Apr', planned: 85, actual: 78 },
        ],
      },
    },

    // WFP Task
    {
      id: 'task-002',
      title: 'Approve WFP Budget Realignment - Road Concreting Project',
      description:
        'External funding budget realignment request for Infrastructure Development',
      dueDate: '2026-04-23T12:00:00Z',
      priority: 'high',
      type: 'WFP',
      status: 'pending',
      actionLabel: 'Review Request',
      metadata: {
        type: 'WFP',
        projectId: 'wfp-ext-2026-015',
        totalBudget: 25_000_000, // ₱25M
        utilizedBudget: 18_750_000, // ₱18.75M
        remainingBudget: 6_250_000, // ₱6.25M
        utilizationPercent: 75.0,
      },
    },

    // Budget Task
    {
      id: 'task-003',
      title: 'Approve Line-Item Budget Request - MOOE Supplies',
      description:
        'Review UACS 5-02-01-010 allocation request for office supplies',
      dueDate: '2026-04-26T10:00:00Z',
      priority: 'medium',
      type: 'BUDGET',
      status: 'pending',
      actionLabel: 'Review Budget',
      metadata: {
        type: 'BUDGET',
        uacsCode: '5-02-01-010',
        uacsDescription: 'Office Supplies Expenses',
        utilizationPercent: 62.5,
        utilizedAmount: 1_250_000, // ₱1.25M
        allocatedAmount: 2_000_000, // ₱2M
      },
    },

    // Strategy Task
    {
      id: 'task-004',
      title: 'Validate MFO Outputs - Public Safety & Order',
      description: 'Review strategic output alignment for Q2 deliverables',
      dueDate: '2026-04-28T16:00:00Z',
      priority: 'medium',
      type: 'STRATEGY',
      status: 'pending',
      actionLabel: 'Validate Outputs',
      metadata: {
        type: 'STRATEGY',
        mfoId: 'mfo-pso-2026',
        mfoName: 'Public Safety & Order Program',
        status: 'ongoing',
        completedCount: 8,
        ongoingCount: 5,
        delayedCount: 2,
      },
    },

    // Procurement Task
    {
      id: 'task-005',
      title: 'Consolidate PPMP Submissions - ICT Equipment',
      description:
        'Finalize PPMP consolidation for Annual Procurement Plan preparation',
      dueDate: '2026-04-24T14:00:00Z',
      priority: 'high',
      type: 'PROCUREMENT',
      status: 'in-progress',
      actionLabel: 'Complete Consolidation',
      metadata: {
        type: 'PROCUREMENT',
        ppmpId: 'ppmp-ict-2026',
        ppmpTitle: 'ICT Equipment & Software Licenses',
        progressPercent: 68.4,
        totalItems: 87,
        consolidatedItems: 62,
      },
    },

    // Another OPCR Task
    {
      id: 'task-006',
      title: 'Approve OPCR Target Revision - Health Services',
      description: 'Review revised target metrics for City Health Office',
      dueDate: '2026-04-29T11:00:00Z',
      priority: 'low',
      type: 'OPCR',
      status: 'pending',
      actionLabel: 'Review Revision',
      metadata: {
        type: 'OPCR',
        commitmentId: 'opcr-q2-cho-2026',
        plannedCompletion: 92,
        actualCompletion: 95,
        chartData: [
          { month: 'Feb', planned: 88, actual: 90 },
          { month: 'Mar', planned: 90, actual: 93 },
          { month: 'Apr', planned: 92, actual: 95 },
        ],
      },
    },

    // Another Procurement Task
    {
      id: 'task-007',
      title: 'Review APP BAC Configuration - Office Equipment',
      description:
        'Validate bidding schedule and mode of procurement for consolidated APP',
      dueDate: '2026-04-27T15:00:00Z',
      priority: 'medium',
      type: 'PROCUREMENT',
      status: 'pending',
      actionLabel: 'Review BAC Config',
      metadata: {
        type: 'PROCUREMENT',
        ppmpId: 'app-office-eq-2026',
        ppmpTitle: 'Office Equipment & Furniture',
        progressPercent: 45.2,
        totalItems: 124,
        consolidatedItems: 56,
      },
    },

    // Another Budget Task
    {
      id: 'task-008',
      title: 'Approve Budget Ceiling Adjustment - Personnel Services',
      description: 'Review revised budget ceiling for payroll allocation',
      dueDate: '2026-04-30T09:00:00Z',
      priority: 'high',
      type: 'BUDGET',
      status: 'pending',
      actionLabel: 'Approve Ceiling',
      metadata: {
        type: 'BUDGET',
        uacsCode: '5-01-01-010',
        uacsDescription: 'Salaries and Wages - Regular',
        utilizationPercent: 88.9,
        utilizedAmount: 45_600_000, // ₱45.6M
        allocatedAmount: 51_300_000, // ₱51.3M
      },
    },
  ]
}

/**
 * Generate mock UACS Obligation vs Allotment data
 */
function generateMockUACSObligationData(): UACSObligationData {
  return {
    quarter: 'Q1',
    year: 2026,
    rows: [
      { code: 'PS', label: 'Personnel Svc.', obligationPercent: 88, allotmentLabel: '₱28M', color: '#3b82f6' },
      { code: 'MOOE', label: 'Maint. & Ops.', obligationPercent: 62, allotmentLabel: '₱18M', color: '#d97706' },
      { code: 'CO', label: 'Capital Outlay', obligationPercent: 38, allotmentLabel: '₱12M', color: '#ef4444' },
      { code: 'FE', label: 'Financial Exp.', obligationPercent: 72, allotmentLabel: '₱7M', color: '#10b981' },
    ],
    barChartData: [
      { department: 'Office of Sec.', obligated: 15_000_000, allotment: 22_000_000 },
      { department: 'Planning', obligated: 10_500_000, allotment: 14_000_000 },
      { department: 'Finance', obligated: 8_000_000, allotment: 11_000_000 },
      { department: 'Admin', obligated: 5_200_000, allotment: 8_000_000 },
      { department: 'Procurement', obligated: 18_000_000, allotment: 25_000_000 },
    ],
  }
}

/**
 * Generate mock APP Procurement Readiness data
 */
function generateMockAppProcurementReadinessData(): AppProcurementReadinessData {
  return {
    overallStatus: 'below-target',
    stages: [
      { label: 'Mode of Proc.', percent: 88, color: '#10b981' },
      { label: 'Item Encoding', percent: 72, color: '#3b82f6' },
      { label: 'Cost Estimates', percent: 61, color: '#d97706' },
      { label: 'End-user Signoff', percent: 45, color: '#f59e0b' },
      { label: 'BAC Resolution', percent: 30, color: '#ef4444' },
    ],
    byMode: [
      { mode: 'Public Bidding', percent: 55, color: '#3b82f6' },
      { mode: 'Shopping', percent: 80, color: '#10b981' },
      { mode: 'Direct Contracting', percent: 90, color: '#10b981' },
      { mode: 'Negotiated Proc.', percent: 42, color: '#d97706' },
    ],
  }
}

/**
 * Generate mock GAA Utilization data
 */
function generateMockGAAUtilizationData(): GAAUtilizationData {
  return {
    percent: 74,
    utilized: 65,
    total: 88,
    unit: 'M',
  }
}

/**
 * Generate mock KPI Classification data
 */
function generateMockKPIClassificationData(): KPIClassificationData {
  return {
    total: 142,
    fiscalYear: 2026,
    items: [
      {
        type: 'strategic',
        label: 'Strategic',
        count: 64,
        percent: 45,
        description: 'Aligned to MFO & PAP targets',
        color: '#3b82f6',
        activeCount: 52,
        divisions: [
          { name: 'Office of Sec.', count: 22 },
          { name: 'Planning Div.', count: 18 },
          { name: 'Finance Div.', count: 14 },
          { name: 'Admin Div.', count: 10 },
        ],
      },
      {
        type: 'core',
        label: 'Core',
        count: 50,
        percent: 35,
        description: 'Frontline / mandated functions',
        color: '#10b981',
        activeCount: 32,
        divisions: [
          { name: 'Office of Sec.', count: 15 },
          { name: 'Planning Div.', count: 12 },
          { name: 'Finance Div.', count: 13 },
          { name: 'Admin Div.', count: 10 },
        ],
      },
      {
        type: 'support',
        label: 'Support',
        count: 28,
        percent: 20,
        description: 'Admin & enabling functions',
        color: '#d97706',
        activeCount: 13,
        divisions: [
          { name: 'HR / Admin', count: 12 },
          { name: 'Finance Div.', count: 10 },
          { name: 'ICT / Records', count: 6 },
        ],
      },
    ],
  }
}

/**
 * Generate mock departments list
 */
function generateMockDepartments(): Department[] {
  return [
    { id: 'dept-001', name: 'Office of the Mayor', code: 'OM' },
    {
      id: 'dept-002',
      name: 'City Planning & Development Office',
      code: 'CPDO',
    },
    { id: 'dept-003', name: 'City Budget Office', code: 'CBO' },
    { id: 'dept-004', name: 'City Treasurer Office', code: 'CTO' },
    { id: 'dept-005', name: 'City Engineering Office', code: 'CEO' },
    { id: 'dept-006', name: 'City Health Office', code: 'CHO' },
    { id: 'dept-007', name: 'City Social Welfare Office', code: 'CSWD' },
    { id: 'dept-008', name: 'City Accounting Office', code: 'CAO' },
  ]
}

// ============================================================================
// Zustand Store
// ============================================================================

/**
 * Dashboard store with mock data and filter management
 */
export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial filter state (current fiscal year, all departments)
  filters: {
    fiscalYear: 2026,
    departmentId: null,
  },

  // Data state (initialized as null/empty, loaded via loadMockData)
  summary: null,
  opcrChartData: [],
  mfoStatusData: [],
  budgetHeatmapData: [],
  kpiHealthData: [],
  ppmpConsolidationData: [],
  uacsObligationData: null,
  appProcurementReadinessData: null,
  gaaUtilizationData: null,
  kpiClassificationData: null,
  tasks: [],
  departments: [],

  // Loading state
  isLoading: false,

  // Actions
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))

    // Auto-refresh data when filters change
    get().refreshData()
  },

  loadMockData: () => {
    set({ isLoading: true })

    // Simulate async data loading
    setTimeout(() => {
      set({
        summary: generateMockSummary(),
        opcrChartData: generateMockOPCRChartData(),
        mfoStatusData: generateMockMFOStatusData(),
        budgetHeatmapData: generateMockBudgetHeatmapData(),
        kpiHealthData: generateMockKPIHealthData(),
        ppmpConsolidationData: generateMockPPMPConsolidationData(),
        uacsObligationData: generateMockUACSObligationData(),
        appProcurementReadinessData: generateMockAppProcurementReadinessData(),
        gaaUtilizationData: generateMockGAAUtilizationData(),
        kpiClassificationData: generateMockKPIClassificationData(),
        tasks: generateMockTasks(),
        departments: generateMockDepartments(),
        isLoading: false,
      })
    }, 300) // 300ms simulated network delay
  },

  refreshData: () => {
    const { filters } = get()

    set({ isLoading: true })

    // Simulate filtered data refresh
    // In production, this would call API with filters as query params
    setTimeout(() => {
      const allTasks = generateMockTasks()
      const allHeatmapData = generateMockBudgetHeatmapData()

      // Apply department filter to tasks and heatmap
      let filteredTasks = allTasks
      let filteredHeatmapData = allHeatmapData

      if (filters.departmentId) {
        // Mock filtering: In production, backend would handle this
        // For now, just reduce task count to simulate filtering
        filteredTasks = allTasks.slice(0, 4) // Show fewer tasks for department view

        // Filter heatmap to single department
        const deptMap: Record<string, string> = {
          'dept-001': 'Office of the Mayor',
          'dept-002': 'City Planning & Development',
          'dept-003': 'City Budget Office',
          'dept-004': 'City Treasurer',
          'dept-005': 'City Engineering',
        }

        const deptName = deptMap[filters.departmentId] || 'Office of the Mayor'
        filteredHeatmapData = allHeatmapData.filter(
          (cell) => cell.department === deptName,
        )
      }

      set({
        summary: generateMockSummary(),
        opcrChartData: generateMockOPCRChartData(),
        mfoStatusData: generateMockMFOStatusData(),
        budgetHeatmapData: filteredHeatmapData,
        kpiHealthData: generateMockKPIHealthData(),
        ppmpConsolidationData: generateMockPPMPConsolidationData(),
        uacsObligationData: generateMockUACSObligationData(),
        appProcurementReadinessData: generateMockAppProcurementReadinessData(),
        gaaUtilizationData: generateMockGAAUtilizationData(),
        kpiClassificationData: generateMockKPIClassificationData(),
        tasks: filteredTasks,
        departments: generateMockDepartments(),
        isLoading: false,
      })
    }, 200)
  },
}))
