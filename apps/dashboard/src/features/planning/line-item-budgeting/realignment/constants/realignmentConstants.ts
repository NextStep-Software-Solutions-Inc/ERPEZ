import type { Activity, ObjectGroup } from '../types/realignment.types'

export const currentFiscalYear = '2026'
export const fiscalYears = ['2024', '2025', '2026']

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

export const STANDARD_ITEMS: Record<'PS' | 'MOOE' | 'CO', string[]> = {
  PS: [
    'Project Coordinator Salary',
    'System Administrator Salary',
    'Consultant Fee',
    'Regular Salaries and Wages',
    'Contractual Compensation',
  ],
  MOOE: [
    'Snacks and Lunch',
    'Venue and Food',
    'Travel allowances',
    'Office Supplies',
    'Utility Expenses',
    'Repairs and Maintenance',
  ],
  CO: [
    'IT Equipment Procurement',
    'Office Equipment',
    'Furniture and Fixtures',
    'Infrastructure Upgrade',
  ],
}

// WFP Plan configurations
export const WFP_PLANS = [
  { id: 'wfp-1', name: 'WFP FY 2026 (1-Year Plan)' },
  { id: 'wfp-2', name: 'WFP FY 2026 - 2027 (2-Year Plan)' },
  { id: 'wfp-3', name: 'WFP FY 2026 - 2028 (3-Year Plan)' },
]

// 1. MOCK DATA: Activity Level (WFP-based)
export const APPROVED_LIB_2026: Activity[] = [
  {
    id: 'ACT-001',
    name: 'LIB-2026-02',
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
        ],
      },
    ],
  },
]

export const ACTIVITIES_WFP2_2026: Activity[] = [
  {
    id: 'ACT-001',
    name: 'LIB-2026-01',
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
                description: 'Year 1 Compensation',
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
  {
    id: 'ACT-002',
    name: 'LIB-2026-02',
    expenditureTypes: [
      {
        id: 'EXP-002',
        name: 'Maintenance & Other Operating Expenses (MOOE)',
        type: 'MOOE',
        itemsOfExpenditure: [
          {
            id: 'ITEM-002',
            name: 'Venue and Food',
            items: [
              {
                id: 'BUD-002',
                description: 'Evaluation meals',
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
    ],
  },
]

export const ACTIVITIES_WFP2_2025: Activity[] = [
  {
    id: 'ACT-001',
    name: 'LIB-2025-01',
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
                description: 'Year 1 Compensation',
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
  {
    id: 'ACT-002',
    name: 'LIB-2025-02',
    expenditureTypes: [
      {
        id: 'EXP-002',
        name: 'Maintenance & Other Operating Expenses (MOOE)',
        type: 'MOOE',
        itemsOfExpenditure: [
          {
            id: 'ITEM-002',
            name: 'Venue and Food',
            items: [
              {
                id: 'BUD-002',
                description: 'Evaluation meals',
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
    ],
  },
]

export const ACTIVITIES_WFP2_2024: Activity[] = [
  {
    id: 'ACT-001',
    name: 'LIB-2024-01',
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
                description: 'Year 1 Compensation',
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
  {
    id: 'ACT-002',
    name: 'LIB-2024-02',
    expenditureTypes: [
      {
        id: 'EXP-002',
        name: 'Maintenance & Other Operating Expenses (MOOE)',
        type: 'MOOE',
        itemsOfExpenditure: [
          {
            id: 'ITEM-002',
            name: 'Venue and Food',
            items: [
              {
                id: 'BUD-002',
                description: 'Evaluation meals',
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
    ],
  },
]

export const ACTIVITIES_WFP3_2026: Activity[] = [
  {
    id: 'ACT-001',
    name: 'LIB-2026-01',
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
                description: 'Year 1 Compensation',
                q1: 35000,
                q2: 35000,
                q3: 35000,
                q4: 35000,
                total: 140000,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ACT-002',
    name: 'LIB-2026-02',
    expenditureTypes: [
      {
        id: 'EXP-002',
        name: 'Maintenance & Other Operating Expenses (MOOE)',
        type: 'MOOE',
        itemsOfExpenditure: [
          {
            id: 'ITEM-002',
            name: 'Venue and Food',
            items: [
              {
                id: 'BUD-002',
                description: 'Evaluation meals',
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
    ],
  },
  {
    id: 'ACT-003',
    name: 'LIB-2026-03',
    expenditureTypes: [
      {
        id: 'EXP-003',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-003',
            name: 'External Evaluator',
            items: [
              {
                id: 'BUD-003',
                description: 'Monitoring Fees',
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

export const ACTIVITIES_WFP3_2025: Activity[] = [
  {
    id: 'ACT-001',
    name: 'LIB-2025-01',
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
                description: 'Year 1 Compensation',
                q1: 35000,
                q2: 35000,
                q3: 35000,
                q4: 35000,
                total: 140000,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ACT-002',
    name: 'LIB-2025-02',
    expenditureTypes: [
      {
        id: 'EXP-002',
        name: 'Maintenance & Other Operating Expenses (MOOE)',
        type: 'MOOE',
        itemsOfExpenditure: [
          {
            id: 'ITEM-002',
            name: 'Venue and Food',
            items: [
              {
                id: 'BUD-002',
                description: 'Evaluation meals',
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
    ],
  },
  {
    id: 'ACT-003',
    name: 'LIB-2025-03',
    expenditureTypes: [
      {
        id: 'EXP-003',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-003',
            name: 'External Evaluator',
            items: [
              {
                id: 'BUD-003',
                description: 'Monitoring Fees',
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

export const ACTIVITIES_WFP3_2024: Activity[] = [
  {
    id: 'ACT-001',
    name: 'LIB-2024-01',
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
                description: 'Year 1 Compensation',
                q1: 35000,
                q2: 35000,
                q3: 35000,
                q4: 35000,
                total: 140000,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ACT-002',
    name: 'LIB-2024-02',
    expenditureTypes: [
      {
        id: 'EXP-002',
        name: 'Maintenance & Other Operating Expenses (MOOE)',
        type: 'MOOE',
        itemsOfExpenditure: [
          {
            id: 'ITEM-002',
            name: 'Venue and Food',
            items: [
              {
                id: 'BUD-002',
                description: 'Evaluation meals',
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
    ],
  },
  {
    id: 'ACT-003',
    name: 'LIB-2024-03',
    expenditureTypes: [
      {
        id: 'EXP-003',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-003',
            name: 'External Evaluator',
            items: [
              {
                id: 'BUD-003',
                description: 'Monitoring Fees',
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

export const APPROVED_LIB_2025: Activity[] = [
  {
    id: 'ACT-001',
    name: 'LIB-2025-02',
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
    ],
  },
]

export const APPROVED_LIB_2024: Activity[] = [
  {
    id: 'ACT-001',
    name: 'LIB-2024-02',
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

// 2. MOCK DATA: OPCR Level (Annual)
export const APPROVED_OPCR_2026: Activity[] = [
  {
    id: 'ACT-OPCR-001',
    name: 'LIB-2026-01',
    expenditureTypes: [
      {
        id: 'EXP-OPCR-001',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-OPCR-001',
            name: 'System Administrator Salary',
            items: [
              {
                id: 'BUD-OPCR-001',
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
      {
        id: 'EXP-OPCR-002',
        name: 'Maintenance & Other Operating Expenses (MOOE)',
        type: 'MOOE',
        type_class: 'MOOE',
        itemsOfExpenditure: [
          {
            id: 'ITEM-OPCR-002',
            name: 'Server Cloud Hosting',
            items: [
              {
                id: 'BUD-OPCR-002',
                description: 'Q1-Q4 AWS Fees',
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
    ] as any,
  },
]

export const APPROVED_OPCR_2025: Activity[] = [
  {
    id: 'ACT-OPCR-001',
    name: 'LIB-2025-01',
    expenditureTypes: [
      {
        id: 'EXP-OPCR-001',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-OPCR-001',
            name: 'System Administrator Salary',
            items: [
              {
                id: 'BUD-OPCR-001',
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

export const APPROVED_OPCR_2024: Activity[] = [
  {
    id: 'ACT-OPCR-001',
    name: 'LIB-2024-01',
    expenditureTypes: [
      {
        id: 'EXP-OPCR-001',
        name: 'Personnel Services (PS)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'ITEM-OPCR-001',
            name: 'System Administrator Salary',
            items: [
              {
                id: 'BUD-OPCR-001',
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

// 3. MOCK DATA: Project Level (WFP-based)
export const APPROVED_PROJECT_LIB_2026: ObjectGroup[] = [
  {
    id: 'OBJ-001',
    name: 'LIB-2026-01',
    code: '01',
    descriptionGroups: [
      {
        id: 'DG-001',
        description: 'Project Coordinator (1-Year)',
        items: [
          {
            id: 'PI-001',
            description: 'Monthly Salary (1-Year)',
            qty: 12,
            unitCost: 25000,
            budget: 300000,
            timelineType: 'ONGOING',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
          },
        ],
      },
    ],
  },
  {
    id: 'OBJ-002',
    name: 'LIB-2026-23',
    code: '23',
    descriptionGroups: [
      {
        id: 'DG-002',
        description: 'Office Supplies',
        items: [
          {
            id: 'PI-002',
            description: 'Paper & Writing Supplies',
            qty: 50,
            unitCost: 300,
            budget: 15000,
            timelineType: 'PERIOD',
            startDate: '2026-02-01',
            endDate: '2026-02-28',
          },
        ],
      },
    ],
  },
]

export const PROJECT_LIB_WFP2_2026: ObjectGroup[] = [
  {
    id: 'OBJ-001',
    name: 'LIB-2026-01',
    code: '01',
    descriptionGroups: [
      {
        id: 'DG-001',
        description: 'Project Coordinator (2-Year)',
        items: [
          {
            id: 'PI-001',
            description: 'Monthly Salary (Year 1 & 2)',
            qty: 24,
            unitCost: 28000,
            budget: 672000,
            timelineType: 'ONGOING',
            startDate: '2026-01-01',
            endDate: '2027-12-31',
          },
        ],
      },
    ],
  },
]

export const PROJECT_LIB_WFP2_2025: ObjectGroup[] = [
  {
    id: 'OBJ-001',
    name: 'LIB-2025-01',
    code: '01',
    descriptionGroups: [
      {
        id: 'DG-001',
        description: 'Project Coordinator (2-Year)',
        items: [
          {
            id: 'PI-001',
            description: 'Monthly Salary (Year 1 & 2)',
            qty: 24,
            unitCost: 28000,
            budget: 672000,
            timelineType: 'ONGOING',
            startDate: '2026-01-01',
            endDate: '2027-12-31',
          },
        ],
      },
    ],
  },
]

export const PROJECT_LIB_WFP2_2024: ObjectGroup[] = [
  {
    id: 'OBJ-001',
    name: 'LIB-2024-01',
    code: '01',
    descriptionGroups: [
      {
        id: 'DG-001',
        description: 'Project Coordinator (2-Year)',
        items: [
          {
            id: 'PI-001',
            description: 'Monthly Salary (Year 1 & 2)',
            qty: 24,
            unitCost: 28000,
            budget: 672000,
            timelineType: 'ONGOING',
            startDate: '2026-01-01',
            endDate: '2027-12-31',
          },
        ],
      },
    ],
  },
]

export const PROJECT_LIB_WFP3_2026: ObjectGroup[] = [
  {
    id: 'OBJ-001',
    name: 'LIB-2026-01',
    code: '01',
    descriptionGroups: [
      {
        id: 'DG-001',
        description: 'Project Coordinator (3-Year)',
        items: [
          {
            id: 'PI-001',
            description: 'Monthly Salary (Year 1-3)',
            qty: 36,
            unitCost: 30000,
            budget: 1080000,
            timelineType: 'ONGOING',
            startDate: '2026-01-01',
            endDate: '2028-12-31',
          },
        ],
      },
    ],
  },
]

export const PROJECT_LIB_WFP3_2025: ObjectGroup[] = [
  {
    id: 'OBJ-001',
    name: 'LIB-2025-01',
    code: '01',
    descriptionGroups: [
      {
        id: 'DG-001',
        description: 'Project Coordinator (3-Year)',
        items: [
          {
            id: 'PI-001',
            description: 'Monthly Salary (Year 1-3)',
            qty: 36,
            unitCost: 30000,
            budget: 1080000,
            timelineType: 'ONGOING',
            startDate: '2026-01-01',
            endDate: '2028-12-31',
          },
        ],
      },
    ],
  },
]

export const PROJECT_LIB_WFP3_2024: ObjectGroup[] = [
  {
    id: 'OBJ-001',
    name: 'LIB-2024-01',
    code: '01',
    descriptionGroups: [
      {
        id: 'DG-001',
        description: 'Project Coordinator (3-Year)',
        items: [
          {
            id: 'PI-001',
            description: 'Monthly Salary (Year 1-3)',
            qty: 36,
            unitCost: 30000,
            budget: 1080000,
            timelineType: 'ONGOING',
            startDate: '2026-01-01',
            endDate: '2028-12-31',
          },
        ],
      },
    ],
  },
]

export const APPROVED_PROJECT_LIB_2025: ObjectGroup[] = [
  {
    id: 'OBJ-001',
    name: 'LIB-2025-01',
    code: '01',
    descriptionGroups: [
      {
        id: 'DG-001',
        description: 'Project Coordinator',
        items: [
          {
            id: 'PI-001',
            description: 'Monthly Salary',
            qty: 12,
            unitCost: 20000,
            budget: 240000,
            timelineType: 'ONGOING',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
          },
        ],
      },
    ],
  },
]

export const APPROVED_PROJECT_LIB_2024: ObjectGroup[] = [
  {
    id: 'OBJ-001',
    name: 'LIB-2024-01',
    code: '01',
    descriptionGroups: [
      {
        id: 'DG-001',
        description: 'Project Coordinator',
        items: [
          {
            id: 'PI-001',
            description: 'Monthly Salary',
            qty: 12,
            unitCost: 18000,
            budget: 216000,
            timelineType: 'ONGOING',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
          },
        ],
      },
    ],
  },
]
