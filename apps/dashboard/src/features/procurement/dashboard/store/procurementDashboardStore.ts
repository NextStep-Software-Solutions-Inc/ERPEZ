/**
 * Procurement Dashboard Store
 *
 * Zustand store for Procurement Dashboard state management with mock data.
 * Follows the Planning Dashboard store pattern exactly.
 *
 * @module features/procurement/dashboard/store/procurementDashboardStore
 */

import { create } from 'zustand'
import type {
  ProcurementDashboardStore,
  ProcurementKPISummary,
  AlertItem,
  FunnelStage,
  TatDataPoint,
  ConsolidationProgress,
  RfqStatusItem,
  AobQueueItem,
  PoFulfillmentData,
  ContractItem,
  ProcurementTask,
  Department,
} from '../types'

// ============================================================================
// Mock Data Generators
// ============================================================================

function generateKPISummary(): ProcurementKPISummary {
  return {
    totalActivePRs: 214,
    consolidatedPRsRate: 68.4,
    activeRFQs: 31,
    pendingBACResolutions: 9,
    totalPOValue: 48_750_000,
    activeContracts: 17,
    prChangeFromLastMonth: 12,
    consolidationChangeFromLastMonth: 5.2,
    rfqChangeFromLastMonth: -3,
    bacChangeFromLastMonth: 2,
    poValueChangeFromLastMonth: 8.4,
    contractChangeFromLastMonth: 1,
  }
}

function generateAlerts(): AlertItem[] {
  return [
    {
      id: 'alert-001',
      type: 'overdue_pr',
      count: 12,
      label: 'Overdue Purchase Requests',
      sublabel: 'Action required immediately',
      severity: 'critical',
      route: '/v2/purchase-requests-pr',
    },
    {
      id: 'alert-002',
      type: 'rfq_closing',
      count: 5,
      label: 'RFQs Closing Within 3 Days',
      sublabel: 'Deadline approaching',
      severity: 'warning',
      route: '/v2/request-for-quotation-rfq',
    },
    {
      id: 'alert-003',
      type: 'pending_ntp',
      count: 8,
      label: 'Pending Notice to Proceed',
      sublabel: 'Contracts awaiting NTP issuance',
      severity: 'info',
      route: '/v2/manage-ntp',
    },
  ]
}

function generateFunnelData(): FunnelStage[] {
  return [
    {
      id: 'requests',
      label: 'REQUESTS',
      icon: 'FileText',
      color: '#3b82f6',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      totalCount: 214,
      subItems: [
        { label: 'Unconsolidated PRs', count: 147, isStalled: false },
        { label: 'Agency Purchase Requests', count: 67, isStalled: true },
      ],
    },
    {
      id: 'bidding',
      label: 'BIDDING',
      icon: 'Gavel',
      color: '#8b5cf6',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      totalCount: 43,
      subItems: [
        { label: 'Active RFQs', count: 31, isStalled: false },
        { label: 'Pending AOB Review', count: 12, isStalled: true },
      ],
    },
    {
      id: 'award',
      label: 'AWARD',
      icon: 'Award',
      color: '#f59e0b',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      totalCount: 18,
      subItems: [
        { label: 'Pending BAC Resolutions', count: 9, isStalled: true },
        { label: 'Pending NOA', count: 9, isStalled: false },
      ],
    },
    {
      id: 'ordering',
      label: 'ORDERING',
      icon: 'ShoppingCart',
      color: '#10b981',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      totalCount: 36,
      subItems: [
        { label: 'Pending Purchase Orders', count: 14, isStalled: false },
        { label: 'Active Contracts', count: 17, isStalled: false },
        { label: 'Pending NTPs', count: 5, isStalled: true },
      ],
    },
  ]
}

function generateTatData(): TatDataPoint[] {
  return [
    { stage: 'Office of Sec.', avgDays: 4,  threshold: 7, stalledWeight: 5  },
    { stage: 'Planning Div.', avgDays: 6,  threshold: 7, stalledWeight: 13 },
    { stage: 'Finance Div.', avgDays: 8,  threshold: 7, stalledWeight: 24 },
    { stage: 'Admin Div.',   avgDays: 11, threshold: 7, stalledWeight: 38 },
    { stage: 'Procurement',  avgDays: 5,  threshold: 7, stalledWeight: 20 },
  ]
}

function generateConsolidationProgress(): ConsolidationProgress {
  return {
    total: 47,
    consolidated: 35,
    inProgress: 5,
    pending: 7,
    percent: 74.5,
    stalledPRs: 5,
  }
}

function generateRfqStatusList(): RfqStatusItem[] {
  return [
    {
      id: 'rfq-001',
      rfqNumber: 'RFQ-2026-0148',
      description: 'Office Supplies & Materials Q2',
      supplierCount: 4,
      closingDate: '2026-04-24T17:00:00Z',
      daysRemaining: 2,
      progressPercent: 75,
      status: 'issued',
    },
    {
      id: 'rfq-002',
      rfqNumber: 'RFQ-2026-0149',
      description: 'ICT Equipment – Laptops & Peripherals',
      supplierCount: 6,
      closingDate: '2026-04-25T17:00:00Z',
      daysRemaining: 3,
      progressPercent: 60,
      status: 'issued',
    },
    {
      id: 'rfq-003',
      rfqNumber: 'RFQ-2026-0145',
      description: 'Janitorial & Sanitation Supplies',
      supplierCount: 3,
      closingDate: '2026-04-20T17:00:00Z',
      daysRemaining: -2,
      progressPercent: 100,
      status: 'overdue',
    },
    {
      id: 'rfq-004',
      rfqNumber: 'RFQ-2026-0151',
      description: 'Medical & Laboratory Supplies',
      supplierCount: 5,
      closingDate: '2026-04-29T17:00:00Z',
      daysRemaining: 7,
      progressPercent: 40,
      status: 'issued',
    },
    {
      id: 'rfq-005',
      rfqNumber: 'RFQ-2026-0152',
      description: 'Fuel & Lubricants – Q2',
      supplierCount: 2,
      closingDate: '2026-05-02T17:00:00Z',
      daysRemaining: 10,
      progressPercent: 25,
      status: 'issued',
    },
    {
      id: 'rfq-006',
      rfqNumber: 'RFQ-2026-0153',
      description: 'Printing & Reproduction Materials',
      supplierCount: 3,
      closingDate: '2026-05-05T17:00:00Z',
      daysRemaining: 13,
      progressPercent: 15,
      status: 'draft',
    },
  ]
}

function generateAobQueueItems(): AobQueueItem[] {
  return [
    { id: 'aob-019', aobNumber: 'AOB-2026-019', description: 'Office Supplies', evalType: 'technical' },
    { id: 'aob-017', aobNumber: 'AOB-2026-017', description: 'IT Equipment', evalType: 'technical' },
    { id: 'aob-015', aobNumber: 'AOB-2026-015', description: 'Janitorial & Sanitation', evalType: 'financial' },
    { id: 'aob-012', aobNumber: 'AOB-2026-012', description: 'Vehicle Parts', evalType: 'financial' },
  ]
}

function generatePoFulfillment(): PoFulfillmentData {
  return {
    poCount: 23,
    segments: [
      { name: 'Issued', value: 23, color: '#3b82f6' },
      { name: 'Accepted', value: 18, color: '#10b981' },
      { name: 'Delivered', value: 11, color: '#6b7280' },
    ],
    totalPOValue: 4_200_000,
    avgDeliveryDays: 12,
    overdueCount: 3,
    uacsBreakdown: [
      { label: 'Goods / Supplies', value: 2_700_000, color: '#3b82f6' },
      { label: 'Equipment', value: 1_300_000, color: '#8b5cf6' },
      { label: 'Services', value: 500_000, color: '#f59e0b' },
    ],
  }
}

function generateContracts(): ContractItem[] {
  return [
    {
      id: 'con-006',
      contractNo: 'CON-2026-006',
      title: 'IT Infrastructure Upgrade Ph. 2',
      contractorName: 'XYZ Builders',
      procurementMode: 'Public Bidding',
      amount: 4_800_000,
      progressPercent: 10,
      status: 'awaiting_ntp',
      endDate: '2026-12-31',
    },
    {
      id: 'con-004',
      contractNo: 'CON-2026-004',
      title: 'Consulting — SPMS Review',
      contractorName: 'ABC Consultants',
      procurementMode: 'Negotiated',
      amount: 1_200_000,
      progressPercent: 0,
      status: 'awaiting_ntp',
      endDate: '2026-09-30',
    },
    {
      id: 'con-003',
      contractNo: 'CON-2026-003',
      title: 'Office Renovation — Bldg A',
      contractorName: 'DEF Const.',
      procurementMode: 'Public Bidding',
      amount: 3_500_000,
      progressPercent: 25,
      status: 'ntp_issued',
      endDate: '2026-08-31',
    },
    {
      id: 'con-002',
      contractNo: 'CON-2026-002',
      title: 'Roads Rehab — Access Road',
      contractorName: 'GHI Corp.',
      procurementMode: 'Public Bidding',
      amount: 6_200_000,
      progressPercent: 60,
      status: 'ongoing',
      endDate: '2026-10-15',
    },
    {
      id: 'con-001',
      contractNo: 'CON-2026-001',
      title: 'Security Services Q1–Q4',
      contractorName: 'JKL Security',
      procurementMode: 'Direct',
      amount: 1_800_000,
      progressPercent: 80,
      status: 'for_renewal',
      endDate: '2026-12-31',
    },
    {
      id: 'con-018',
      contractNo: 'CON-2025-018',
      title: 'Maintenance — Elec. Systems',
      contractorName: 'MNO Tech',
      procurementMode: 'Shopping',
      amount: 900_000,
      progressPercent: 75,
      status: 'ongoing',
      endDate: '2026-06-30',
    },
  ]
}

function generateTasks(): ProcurementTask[] {
  return [
    {
      id: 'ptask-001',
      title: 'Consolidate ICT Equipment PRs – Q2',
      description:
        'Merge submitted purchase requests for ICT equipment to prepare for APP consolidation.',
      dueDate: '2026-04-24T14:00:00Z',
      priority: 'high',
      type: 'CONSOLIDATE_PR',
      status: 'in-progress',
      actionLabel: 'Go to Consolidation',
      secondaryActionLabel: 'View PRs',
      actionRoute: '/v2/consolidate-prs',
      metadata: {
        type: 'CONSOLIDATE_PR',
        consolidatedPrId: 'cpr-ict-2026-q2',
        totalPRs: 87,
        consolidatedCount: 59,
        pendingCount: 28,
        progressPercent: 67.8,
      },
    },
    {
      id: 'ptask-002',
      title: 'Evaluate AOB – Office Supplies RFQ-0148',
      description:
        'Complete technical and financial evaluation of bids received for office supplies.',
      dueDate: '2026-04-25T17:00:00Z',
      priority: 'high',
      type: 'EVALUATE_AOB',
      status: 'pending',
      actionLabel: 'Open AOB Workspace',
      secondaryActionLabel: 'View RFQ',
      actionRoute: '/v2/abstract-of-bids-aob',
      metadata: {
        type: 'EVALUATE_AOB',
        aobId: 'aob-2026-0148',
        rfqNumber: 'RFQ-2026-0148',
        totalEvaluations: 4,
        technicalEvaluation: 3,
        financialEvaluation: 1,
      },
    },
    {
      id: 'ptask-003',
      title: 'Approve NOA – DataTech Solutions Inc.',
      description:
        'Review and approve Notice of Award for ICT Equipment contract worth ₱3.2M.',
      dueDate: '2026-04-26T12:00:00Z',
      priority: 'medium',
      type: 'APPROVE_NOA',
      status: 'pending',
      actionLabel: 'Review & Approve',
      secondaryActionLabel: 'View Documents',
      actionRoute: '/v2/manage-noa',
      metadata: {
        type: 'APPROVE_NOA',
        noaId: 'noa-2026-002',
        supplierName: 'DataTech Solutions Inc.',
        bidAmount: 3_200_000,
        performanceScore: 4.2,
        previousContracts: 3,
        onTimeDeliveryRate: 88,
      },
    },
    {
      id: 'ptask-004',
      title: 'Issue NTP – MediSupply PH Corp.',
      description:
        'Issue Notice to Proceed for medical supplies contract. Mobilization date is overdue.',
      dueDate: '2026-04-23T09:00:00Z',
      priority: 'high',
      type: 'ISSUE_NTP',
      status: 'overdue',
      actionLabel: 'Issue NTP Now',
      secondaryActionLabel: 'View Contract',
      actionRoute: '/v2/manage-ntp',
      metadata: {
        type: 'ISSUE_NTP',
        ntpId: 'ntp-2026-003',
        contractNo: 'CON-2026-003',
        contractAmount: 1_850_000,
        timelinePercent: 15,
        mobilizationDate: '2026-04-23T00:00:00Z',
        pendingDays: -1,
      },
    },
  ]
}

function generateDepartments(): Department[] {
  return [
    { id: 'dept-001', name: 'Office of the Mayor', code: 'OM' },
    { id: 'dept-002', name: 'City Planning & Development Office', code: 'CPDO' },
    { id: 'dept-003', name: 'City Budget Office', code: 'CBO' },
    { id: 'dept-004', name: 'City Treasurer Office', code: 'CTO' },
    { id: 'dept-005', name: 'City Engineering Office', code: 'CEO' },
    { id: 'dept-006', name: 'City Health Office', code: 'CHO' },
    { id: 'dept-007', name: 'City Social Welfare & Development', code: 'CSWD' },
    { id: 'dept-008', name: 'City Accounting Office', code: 'CAO' },
  ]
}

// ============================================================================
// Zustand Store
// ============================================================================

export const useProcurementDashboardStore = create<ProcurementDashboardStore>((set, get) => ({
  // Initial state
  filters: { fiscalYear: 2026, departmentId: null },
  kpiSummary: null,
  alerts: [],
  funnelData: [],
  tatData: [],
  consolidationProgress: null,
  rfqStatusList: [],
  aobQueueItems: [],
  poFulfillment: null,
  contracts: [],
  tasks: [],
  departments: [],
  isLoading: false,

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }))
    get().refreshData()
  },

  loadMockData: () => {
    set({ isLoading: true })
    setTimeout(() => {
      set({
        kpiSummary: generateKPISummary(),
        alerts: generateAlerts(),
        funnelData: generateFunnelData(),
        tatData: generateTatData(),
        consolidationProgress: generateConsolidationProgress(),
        rfqStatusList: generateRfqStatusList(),
        aobQueueItems: generateAobQueueItems(),
        poFulfillment: generatePoFulfillment(),
        contracts: generateContracts(),
        tasks: generateTasks(),
        departments: generateDepartments(),
        isLoading: false,
      })
    }, 300)
  },

  refreshData: () => {
    const { filters } = get()
    set({ isLoading: true })

    setTimeout(() => {
      const allTasks = generateTasks()
      const filteredTasks = filters.departmentId
        ? allTasks.slice(0, 2)
        : allTasks

      set({
        kpiSummary: generateKPISummary(),
        alerts: generateAlerts(),
        funnelData: generateFunnelData(),
        tatData: generateTatData(),
        consolidationProgress: generateConsolidationProgress(),
        rfqStatusList: generateRfqStatusList(),
        aobQueueItems: generateAobQueueItems(),
        poFulfillment: generatePoFulfillment(),
        contracts: generateContracts(),
        tasks: filteredTasks,
        departments: generateDepartments(),
        isLoading: false,
      })
    }, 200)
  },
}))
