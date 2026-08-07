/**
 * Mock data for Budget Distribution module
 * Step 3: Distribute base KPI targets to offices for negotiation
 */

export interface BudgetAllocation {
  id: string
  officeId: string
  officeName: string
  kpiId: string
  kpiCode: string
  kpiName: string
  baseTarget: number
  allocatedBudget: number
  percentageOfTotal: number
  q1: number | null
  q2: number | null
  q3: number | null
  q4: number | null
  notes: string
  isLocked: boolean
  status: 'pending' | 'allocated' | 'approved'
}

export interface OfficeAssignment {
  id: string
  officeId: string
  officeName: string
  kpiId: string
  kpiCode: string
  kpiName: string
  allocationFromPlanning: number
  officeTarget: number | null
  q1: number | null
  q2: number | null
  q3: number | null
  q4: number | null
  notes: string
  isFromPlanning: boolean
  isEdited: boolean
  status: 'pending' | 'submitted' | 'approved'
}

export const MOCK_OFFICES = [
  { id: 'OFC001', name: 'Finance Office' },
  { id: 'OFC002', name: 'Human Resources' },
  { id: 'OFC003', name: 'Operations' },
  { id: 'OFC004', name: 'Strategic Planning' },
  { id: 'OFC005', name: 'Risk Management' },
]

export const MOCK_CURRENT_OFFICE = {
  id: 'OFC001',
  name: 'Finance Office',
  head: 'John Doe',
  location: 'Head Office',
}

export const MOCK_BUDGET_ALLOCATIONS: BudgetAllocation[] = [
  {
    id: 'BA001',
    officeId: 'OFC001',
    officeName: 'Finance Office',
    kpiId: 'KPI001',
    kpiCode: 'REV-001',
    kpiName: 'Revenue Growth',
    baseTarget: 100000,
    allocatedBudget: 30000,
    percentageOfTotal: 30,
    q1: 7500,
    q2: 7500,
    q3: 7500,
    q4: 7500,
    notes: 'Initial allocation',
    isLocked: false,
    status: 'pending',
  },
  {
    id: 'BA002',
    officeId: 'OFC002',
    officeName: 'Human Resources',
    kpiId: 'KPI001',
    kpiCode: 'REV-001',
    kpiName: 'Revenue Growth',
    baseTarget: 100000,
    allocatedBudget: 25000,
    percentageOfTotal: 25,
    q1: 6250,
    q2: 6250,
    q3: 6250,
    q4: 6250,
    notes: '',
    isLocked: false,
    status: 'pending',
  },
]
export const MOCK_OFFICE_ASSIGNMENTS: OfficeAssignment[] = [
  {
    id: 'OA001',
    officeId: 'OFC001',
    officeName: 'Finance Office',
    kpiId: 'KPI001',
    kpiCode: 'REV-001',
    kpiName: 'Revenue Growth',
    allocationFromPlanning: 30000,
    officeTarget: 32000,
    q1: 8000,
    q2: 8000,
    q3: 8000,
    q4: 8000,
    notes: 'Increased target based on team capacity',
    isFromPlanning: true,
    isEdited: true,
    status: 'pending',
  },
  {
    id: 'OA002',
    officeId: 'OFC001',
    officeName: 'Finance Office',
    kpiId: 'KPI002',
    kpiCode: 'COST-001',
    kpiName: 'Cost Reduction',
    allocationFromPlanning: 15000,
    officeTarget: 15000,
    q1: 3750,
    q2: 3750,
    q3: 3750,
    q4: 3750,
    notes: '',
    isFromPlanning: true,
    isEdited: false,
    status: 'pending',
  },
  {
    id: 'OA003',
    officeId: 'OFC001',
    officeName: 'Finance Office',
    kpiId: 'KPI010',
    kpiCode: 'EMP-001',
    kpiName: 'Employee Satisfaction',
    allocationFromPlanning: 0,
    officeTarget: null,
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    notes: 'Will add during submission phase',
    isFromPlanning: false,
    isEdited: false,
    status: 'pending',
  },
]