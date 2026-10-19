/**
 * Constants for Budget Realignment Feature
 * Mock data, configuration, and lookup tables
 */

import type {
  Activity,
  ChangeIndicator,
} from '../types/realignment.types'

// ===== APPROVED LIB BY YEAR =====

export const APPROVED_LIB_2026: Activity[] = [
  {
    id: 'ACT-001',
    name: 'Call for Applicants',
    expenditureTypes: [
      {
        id: 'EXP-001',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-001',
            name: 'Project Coordinator Salary',
            items: [
              {
                id: 'BUD-001',
                description: 'Monthly Compensation',
                q1: 25000,
                q2: 25000,
                q3: 25000,
                q4: 25000,
                total: 100000,
              },
            ],
          },
        ],
      },
      {
        id: 'EXP-002',
        name: 'Maintenance & Other Operating Expenses (MOOE)',
        type: 'MOOE',
        itemsOfExpenditure: [
          {
            id: 'ITEM-002',
            name: 'Snacks and Lunch',
            items: [
              {
                id: 'BUD-002',
                description: 'Q1 - 50 pax @ ₱300',
                q1: 15000,
                q2: 0,
                q3: 0,
                q4: 0,
                total: 15000,
              },
              {
                id: 'BUD-003',
                description: 'Q2 - 50 pax @ ₱300',
                q1: 0,
                q2: 15000,
                q3: 0,
                q4: 0,
                total: 15000,
              },
            ],
          },
          {
            id: 'ITEM-003',
            name: 'Honorarium - Speakers',
            items: [
              {
                id: 'BUD-004',
                description: 'Program speakers',
                q1: 10000,
                q2: 10000,
                q3: 0,
                q4: 0,
                total: 20000,
              },
            ],
          },
        ],
      },
    ],
  },
]

export const APPROVED_LIB_2025: Activity[] = [
  {
    id: 'ACT-001',
    name: 'Call for Applicants',
    expenditureTypes: [
      {
        id: 'EXP-001',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-001',
            name: 'Project Coordinator Salary',
            items: [
              {
                id: 'BUD-001',
                description: 'Monthly Compensation',
                q1: 20000,
                q2: 20000,
                q3: 20000,
                q4: 20000,
                total: 80000,
              },
            ],
          },
        ],
      },
      {
        id: 'EXP-002',
        name: 'Maintenance & Other Operating Expenses (MOOE)',
        type: 'MOOE',
        itemsOfExpenditure: [
          {
            id: 'ITEM-002',
            name: 'Snacks and Lunch',
            items: [
              {
                id: 'BUD-002',
                description: 'Q1 - 40 pax @ ₱250',
                q1: 10000,
                q2: 0,
                q3: 0,
                q4: 0,
                total: 10000,
              },
              {
                id: 'BUD-003',
                description: 'Q2 - 40 pax @ ₱250',
                q1: 0,
                q2: 10000,
                q3: 0,
                q4: 0,
                total: 10000,
              },
            ],
          },
        ],
      },
    ],
  },
]

export const APPROVED_LIB_2024: Activity[] = [
  {
    id: 'ACT-001',
    name: 'Call for Applicants',
    expenditureTypes: [
      {
        id: 'EXP-001',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-001',
            name: 'Project Coordinator Salary',
            items: [
              {
                id: 'BUD-001',
                description: 'Monthly Compensation',
                q1: 18000,
                q2: 18000,
                q3: 18000,
                q4: 18000,
                total: 72000,
              },
            ],
          },
        ],
      },
    ],
  },
]

// ===== MODIFIED VERSIONS FOR COMPARISON =====

export const MODIFIED_LIB_2024_V2: Activity[] = [
  {
    id: 'ACT-001',
    name: 'Call for Applicants',
    expenditureTypes: [
      {
        id: 'EXP-001',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-001',
            name: 'Project Coordinator Salary',
            items: [
              {
                id: 'BUD-001',
                description: 'Monthly Compensation',
                q1: 30000,
                q2: 30000,
                q3: 30000,
                q4: 30000,
                total: 120000,
              },
            ],
          },
        ],
      },
    ],
  },
]

export const MODIFIED_LIB_2024_V3: Activity[] = [
  {
    id: 'ACT-001',
    name: 'Call for Applicants',
    expenditureTypes: [
      {
        id: 'EXP-001',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-001',
            name: 'Project Coordinator Salary',
            items: [
              {
                id: 'BUD-001',
                description: 'Monthly Compensation',
                q1: 25000,
                q2: 25000,
                q3: 25000,
                q4: 25000,
                total: 100000,
              },
            ],
          },
        ],
      },
    ],
  },
]

export const MODIFIED_LIB_2025_V2: Activity[] = [
  {
    id: 'ACT-001',
    name: 'Call for Applicants',
    expenditureTypes: [
      {
        id: 'EXP-001',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-001',
            name: 'Project Coordinator Salary',
            items: [
              {
                id: 'BUD-001',
                description: 'Monthly Compensation',
                q1: 28000,
                q2: 28000,
                q3: 28000,
                q4: 28000,
                total: 112000,
              },
            ],
          },
        ],
      },
    ],
  },
]

export const MODIFIED_LIB_2025_V3: Activity[] = [
  {
    id: 'ACT-001',
    name: 'Call for Applicants',
    expenditureTypes: [
      {
        id: 'EXP-001',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-001',
            name: 'Project Coordinator Salary',
            items: [
              {
                id: 'BUD-001',
                description: 'Monthly Compensation',
                q1: 32000,
                q2: 32000,
                q3: 32000,
                q4: 32000,
                total: 128000,
              },
            ],
          },
        ],
      },
    ],
  },
]

// ===== CONFIGURATION =====

export const CURRENT_FISCAL_YEAR = '2026'
export const FISCAL_YEARS = ['2024', '2025', '2026']

export const LIB_DATA_BY_YEAR: Record<string, Activity[]> = {
  '2026': APPROVED_LIB_2026,
  '2025': APPROVED_LIB_2025,
  '2024': APPROVED_LIB_2024,
}

export const LIB_VERSIONS_BY_YEAR: Record<string, any[]> = {
  '2026': [
    {
      version: 1,
      timestamp: new Date().toISOString(),
      reason: 'Initial approved LIB for FY 2026',
      modifiedBy: 'Budget Planning Committee',
      activities: APPROVED_LIB_2026,
      approved: true,
    },
  ],
  '2025': [
    {
      version: 1,
      timestamp: new Date(2025, 0, 15).toISOString(),
      reason: 'Initial approved LIB for FY 2025',
      modifiedBy: 'Budget Planning Committee',
      activities: APPROVED_LIB_2025,
      approved: true,
    },
    {
      version: 2,
      timestamp: new Date(2025, 2, 10).toISOString(),
      reason: 'Budget realignment due to additional requirements',
      modifiedBy: 'Finance Manager',
      activities: MODIFIED_LIB_2025_V2,
      approved: false,
    },
    {
      version: 3,
      timestamp: new Date(2025, 5, 20).toISOString(),
      reason: 'Mid-year budget adjustment and optimization',
      modifiedBy: 'Budget Planning Committee',
      activities: MODIFIED_LIB_2025_V3,
      approved: false,
    },
  ],
  '2024': [
    {
      version: 1,
      timestamp: new Date(2024, 0, 15).toISOString(),
      reason: 'Initial approved LIB for FY 2024',
      modifiedBy: 'Budget Planning Committee',
      activities: APPROVED_LIB_2024,
      approved: true,
    },
    {
      version: 2,
      timestamp: new Date(2024, 2, 5).toISOString(),
      reason: 'Budget realignment for Q2-Q4',
      modifiedBy: 'Finance Manager',
      activities: MODIFIED_LIB_2024_V2,
      approved: false,
    },
    {
      version: 3,
      timestamp: new Date(2024, 8, 15).toISOString(),
      reason: 'Year-end budget adjustment',
      modifiedBy: 'Budget Planning Committee',
      activities: MODIFIED_LIB_2024_V3,
      approved: false,
    },
  ],
}

// ===== MODIFICATION REASONS =====

export const MODIFICATION_REASONS = [
  'UnforeseenModification',
  'Reassessment',
  'AdditionalRequirements',
]

export const MODIFICATION_REASON_LABELS: Record<string, string> = {
  UnforeseenModification: 'Unforeseen Modification',
  Reassessment: 'Reassessment',
  AdditionalRequirements: 'Additional Requirements',
}

export const formatModificationReason = (reason?: string | null): string => {
  if (!reason) return ''
  return MODIFICATION_REASON_LABELS[reason] || reason.replace(/([a-z])([A-Z])/g, '$1 $2')
}

// ===== DEFAULT ITEM-OF-EXPENDITURE LOOKUP =====

export const MOCK_IOE: Record<'PS' | 'MOOE' | 'CO', string[]> = {
  PS: [
    'Project Coordinator Salary',
    'Staff Salaries',
    'Consultant Fees',
    'Overtime Allowance',
  ],
  MOOE: [
    'Snacks and Lunch',
    'Honorarium - Speakers',
    'Office Supplies',
    'Travel and Transportation',
    'Printing and Publication',
  ],
  CO: [
    'Equipment Purchase',
    'Furniture and Fixtures',
    'IT Hardware',
    'Infrastructure Improvements',
  ],
}

// ===== COLOR SCHEMES =====

export const EXPENDITURE_TYPE_COLOR_SCHEMES: Record<
  'PS' | 'MOOE' | 'CO',
  { bg: string; border: string; badge: string; header: string; progressBar: string; text: string; icon: string }
> = {
  PS: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700 border-green-300',
    header: 'hover:bg-green-100',
    progressBar: 'bg-green-500',
    text: 'text-green-900',
    icon: 'text-green-600',
  },
  MOOE: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
    header: 'hover:bg-blue-100',
    progressBar: 'bg-blue-500',
    text: 'text-blue-900',
    icon: 'text-blue-600',
  },
  CO: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700 border-purple-300',
    header: 'hover:bg-purple-100',
    progressBar: 'bg-purple-500',
    text: 'text-purple-900',
    icon: 'text-purple-600',
  },
}

// ===== CHANGE INDICATOR BADGES =====

export const CHANGE_INDICATOR_BADGES: Record<
  ChangeIndicator,
  { bg: string; text: string; icon: string; label: string }
> = {
  added: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: '✓',
    label: 'Added',
  },
  deleted: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: '✕',
    label: 'Deleted',
  },
  edited: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    icon: '◆',
    label: 'Edited',
  },
  unchanged: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    icon: '○',
    label: 'Unchanged',
  },
}

// ===== CHANGE COLOR MAPPING =====

export const CHANGE_COLOR_MAP: Record<ChangeIndicator, string> = {
  added: 'border-green-300 bg-green-50',
  deleted: 'border-red-300 bg-red-50',
  edited: 'border-yellow-300 bg-yellow-50',
  unchanged: 'border-slate-300 bg-slate-50',
}
