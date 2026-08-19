/**
 * Mock Approved APPs for APR Creation
 * 
 * Contains realistic approved Annual Procurement Plans (APPs) with:
 * - BAC (Budget Alignment Checklist) line items
 * - Procurement milestones
 * - Budget data for validation
 * 
 * Used by getApprovedAPPsRequest to populate APP selection dialog
 */

import type { AppMaster, BACLineItem, BACMilestones } from '@/features/planning/app-consolidation/types'

// Sample BAC Milestones for all items
const sampleMilestones: BACMilestones = {
  advertisementDate: '2026-05-15',
  submissionDate: '2026-06-15',
  noticeOfAwardDate: '2026-07-15',
  contractSigningDate: '2026-08-15',
}

// Sample BAC Line Items for APP-001
const appLineItems001: BACLineItem[] = [
  {
    id: 'bac-001-001',
    description: 'Office Chairs (Executive)',
    unit: 'unit',
    quantity: 15,
    unitCost: 8500,
    totalAmount: 127500,
    modeOfProcurement: 'Competitive Bidding',
    allotmentClass: 'MOOE',
    office: 'Administration',
    schedules: [
      { id: 'sch-001', period: 'Q2', scheduledDate: '2026-06-30', quantity: 15 },
    ],
    milestones: sampleMilestones,
    remarks: 'Standard office furniture',
    eligibleForEPA: false,
  },
  {
    id: 'bac-001-002',
    description: 'Office Desks (Standing)',
    unit: 'unit',
    quantity: 20,
    unitCost: 12500,
    totalAmount: 250000,
    modeOfProcurement: 'Competitive Bidding',
    allotmentClass: 'MOOE',
    office: 'Administration',
    schedules: [
      { id: 'sch-002', period: 'Q2', scheduledDate: '2026-06-30', quantity: 20 },
    ],
    milestones: sampleMilestones,
    remarks: 'Ergonomic standing desks',
    eligibleForEPA: false,
  },
  {
    id: 'bac-001-003',
    description: 'Laptops (Business Class)',
    unit: 'unit',
    quantity: 10,
    unitCost: 65000,
    totalAmount: 650000,
    modeOfProcurement: 'Competitive Bidding',
    allotmentClass: 'MOOE',
    office: 'IT Department',
    schedules: [
      { id: 'sch-003', period: 'Q3', scheduledDate: '2026-09-30', quantity: 10 },
    ],
    milestones: sampleMilestones,
    remarks: 'Intel i7/16GB RAM minimum',
    eligibleForEPA: true,
    epaRemarks: 'Eligible for electronic procurement',
  },
  {
    id: 'bac-001-004',
    description: 'Network Printers',
    unit: 'unit',
    quantity: 8,
    unitCost: 45000,
    totalAmount: 360000,
    modeOfProcurement: 'Shopping',
    allotmentClass: 'MOOE',
    office: 'IT Department',
    schedules: [
      { id: 'sch-004', period: 'Q3', scheduledDate: '2026-09-30', quantity: 8 },
    ],
    milestones: sampleMilestones,
    remarks: 'Multifunction laser printers',
    eligibleForEPA: true,
  },
  {
    id: 'bac-001-005',
    description: 'Office Supplies (Annual)',
    unit: 'lot',
    quantity: 4,
    unitCost: 50000,
    totalAmount: 200000,
    modeOfProcurement: 'Competitive Bidding',
    allotmentClass: 'MOOE',
    office: 'Administration',
    schedules: [
      { id: 'sch-005', period: 'Q1', scheduledDate: '2026-03-31', quantity: 1 },
      { id: 'sch-006', period: 'Q2', scheduledDate: '2026-06-30', quantity: 1 },
      { id: 'sch-007', period: 'Q3', scheduledDate: '2026-09-30', quantity: 1 },
      { id: 'sch-008', period: 'Q4', scheduledDate: '2026-12-31', quantity: 1 },
    ],
    milestones: sampleMilestones,
    remarks: 'Quarterly procurement',
    eligibleForEPA: false,
  },
]

// Sample BAC Line Items for APP-002
const appLineItems002: BACLineItem[] = [
  {
    id: 'bac-002-001',
    description: 'Medical Supplies (Monthly)',
    unit: 'lot',
    quantity: 12,
    unitCost: 75000,
    totalAmount: 900000,
    modeOfProcurement: 'Competitive Bidding',
    allotmentClass: 'MOOE',
    office: 'Medical Division',
    schedules: [
      { id: 'sch-009', period: 'Monthly', scheduledDate: '2026-05-31', quantity: 12 },
    ],
    milestones: sampleMilestones,
    remarks: 'Essential medical consumables',
    eligibleForEPA: false,
  },
  {
    id: 'bac-002-002',
    description: 'Medical Equipment',
    unit: 'unit',
    quantity: 5,
    unitCost: 150000,
    totalAmount: 750000,
    modeOfProcurement: 'Competitive Bidding',
    allotmentClass: 'CO',
    office: 'Medical Division',
    schedules: [
      { id: 'sch-010', period: 'Q2', scheduledDate: '2026-06-30', quantity: 5 },
    ],
    milestones: sampleMilestones,
    remarks: 'Diagnostic and monitoring equipment',
    eligibleForEPA: true,
  },
  {
    id: 'bac-002-003',
    description: 'Laboratory Reagents',
    unit: 'lot',
    quantity: 4,
    unitCost: 100000,
    totalAmount: 400000,
    modeOfProcurement: 'Competitive Bidding',
    allotmentClass: 'MOOE',
    office: 'Medical Division',
    schedules: [
      { id: 'sch-011', period: 'Quarterly', scheduledDate: '2026-06-30', quantity: 4 },
    ],
    milestones: sampleMilestones,
    remarks: 'Quarterly laboratory supplies',
    eligibleForEPA: false,
  },
]

// Sample BAC Line Items for APP-003
const appLineItems003: BACLineItem[] = [
  {
    id: 'bac-003-001',
    description: 'Training Seminar - 3 days',
    unit: 'session',
    quantity: 2,
    unitCost: 180000,
    totalAmount: 360000,
    modeOfProcurement: 'Competitive Bidding',
    allotmentClass: 'MOOE',
    office: 'HR Division',
    schedules: [
      { id: 'sch-012', period: 'Q2', scheduledDate: '2026-06-30', quantity: 1 },
      { id: 'sch-013', period: 'Q4', scheduledDate: '2026-12-31', quantity: 1 },
    ],
    milestones: sampleMilestones,
    remarks: 'Staff development programs',
    eligibleForEPA: true,
  },
  {
    id: 'bac-003-002',
    description: 'Consulting Services - System Integration',
    unit: 'lot',
    quantity: 1,
    unitCost: 500000,
    totalAmount: 500000,
    modeOfProcurement: 'Competitive Bidding',
    allotmentClass: 'MOOE',
    office: 'IT Department',
    schedules: [
      { id: 'sch-014', period: 'Q1-Q3', scheduledDate: '2026-09-30', quantity: 1 },
    ],
    milestones: sampleMilestones,
    remarks: 'ERP system implementation support',
    eligibleForEPA: true,
  },
]

// Mock approved APP 001
const mockApprovedApp001: AppMaster = {
  id: 'app-001',
  appType: 'Final',
  ppmpIds: ['ppmp-001', 'ppmp-002'],
  fiscalYear: 2026,
  appName: 'Annual Procurement Plan 2026 - Administrative Division',
  appCode: 'APP-2026-ADM-001',
  appNumber: 'APP-2026-001',
  status: 'Approved',
  createdAt: '2026-02-01T08:00:00Z',
  updatedAt: '2026-03-15T10:30:00Z',
  createdBy: 'bac-secretariat-001',
  aggregationResults: {
    items: [],
    totalAmount: appLineItems001.reduce((sum, item) => sum + item.totalAmount, 0),
  },
  bac: {
    id: 'bac-001',
    appId: 'app-001',
    lineItems: appLineItems001,
    sourceFunds: ['General Fund'],
    totalBudget: appLineItems001.reduce((sum, item) => sum + item.totalAmount, 0),
    modeOfProcurements: ['Competitive Bidding', 'Shopping'],
  },
  signatories: {
    preparedBy: [{ id: 'bac-001', name: 'Carlos Rivera', position: 'BAC Secretary', department: 'Procurement' }],
    reviewedBy: [{ id: 'bac-002', name: 'Maria Santos', position: 'Finance Manager', department: 'Finance' }],
    approvedBy: [{ id: 'bac-003', name: 'Roberto Tan', position: 'Director', department: 'Administration' }],
  },
}

// Mock approved APP 002
const mockApprovedApp002: AppMaster = {
  id: 'app-002',
  appType: 'Final',
  ppmpIds: ['ppmp-003'],
  fiscalYear: 2026,
  appName: 'Annual Procurement Plan 2026 - Medical Services',
  appCode: 'APP-2026-MED-001',
  appNumber: 'APP-2026-002',
  status: 'Approved',
  createdAt: '2026-02-10T09:00:00Z',
  updatedAt: '2026-03-20T11:00:00Z',
  createdBy: 'bac-secretariat-002',
  aggregationResults: {
    items: [],
    totalAmount: appLineItems002.reduce((sum, item) => sum + item.totalAmount, 0),
  },
  bac: {
    id: 'bac-002',
    appId: 'app-002',
    lineItems: appLineItems002,
    sourceFunds: ['General Fund', 'Health Fund'],
    totalBudget: appLineItems002.reduce((sum, item) => sum + item.totalAmount, 0),
    modeOfProcurements: ['Competitive Bidding'],
  },
  signatories: {
    preparedBy: [{ id: 'bac-004', name: 'Jennifer Lopez', position: 'BAC Secretary', department: 'Medical' }],
    reviewedBy: [{ id: 'bac-005', name: 'Dr. Jose Cruz', position: 'Medical Director', department: 'Medical' }],
    approvedBy: [{ id: 'bac-006', name: 'Patricia Reyes', position: 'VP Medical', department: 'Medical' }],
  },
}

// Mock approved APP 003
const mockApprovedApp003: AppMaster = {
  id: 'app-003',
  appType: 'Final',
  ppmpIds: ['ppmp-004', 'ppmp-005'],
  fiscalYear: 2026,
  appName: 'Annual Procurement Plan 2026 - HR & Services',
  appCode: 'APP-2026-HRS-001',
  appNumber: 'APP-2026-003',
  status: 'Approved',
  createdAt: '2026-02-15T08:30:00Z',
  updatedAt: '2026-03-18T14:00:00Z',
  createdBy: 'bac-secretariat-003',
  aggregationResults: {
    items: [],
    totalAmount: appLineItems003.reduce((sum, item) => sum + item.totalAmount, 0),
  },
  bac: {
    id: 'bac-003',
    appId: 'app-003',
    lineItems: appLineItems003,
    sourceFunds: ['General Fund'],
    totalBudget: appLineItems003.reduce((sum, item) => sum + item.totalAmount, 0),
    modeOfProcurements: ['Competitive Bidding'],
  },
  signatories: {
    preparedBy: [{ id: 'bac-007', name: 'Angela Torres', position: 'BAC Secretary', department: 'HR' }],
    reviewedBy: [{ id: 'bac-008', name: 'Michael Johnson', position: 'Finance Officer', department: 'Finance' }],
    approvedBy: [{ id: 'bac-009', name: 'Sandra Lee', position: 'Executive Director', department: 'Executive' }],
  },
}

/**
 * List of all approved APPs available for APR creation
 * This is the data source for the APP selection dialog
 */
export const mockApprovedAPPs: AppMaster[] = [
  mockApprovedApp001,
  mockApprovedApp002,
  mockApprovedApp003,
]

/**
 * Get approved APP by ID
 */
export const getMockApprovedApp = (appId: string): AppMaster | undefined => {
  return mockApprovedAPPs.find((app) => app.id === appId)
}

/**
 * Filter approved APPs by fiscal year
 */
export const filterApprovedAppsByFiscalYear = (fiscalYear: number): AppMaster[] => {
  return mockApprovedAPPs.filter((app) => app.fiscalYear === fiscalYear)
}
