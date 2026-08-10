export type Position = {
  id: string
  code: string
  title: string
  salaryGrade: string
  authorizedFTE: number
  orgUnitId: string
  plantillaNumber?: string
  status: 'vacant' | 'filled' | 'frozen'
  // Government Schema Fields
  itemNumber?: string // DBM Plantilla Item Number (required for plantilla, optional for JO/COS)
  stepIncrement: number
  isPlantilla: boolean
  effectiveDate?: string
  createdAt?: string
  updatedAt?: string
}

let POS_DB: Position[] = [
  // ==================== OFFICE OF THE SECRETARY ====================
  {
    id: 'p-1',
    code: 'POS-OSEC-001',
    title: 'Secretary (Cabinet Member)',
    salaryGrade: 'SG-33',
    authorizedFTE: 1,
    orgUnitId: '1',
    plantillaNumber: 'PL-0001',
    status: 'filled',
    itemNumber: 'OSEC-2024-001',
    stepIncrement: 3,
    isPlantilla: true,
    effectiveDate: '2022-06-30',
  },

  // ==================== EXECUTIVE OFFICE ====================
  {
    id: 'p-2',
    code: 'POS-EXEC-001',
    title: 'Undersecretary for Administration',
    salaryGrade: 'SG-31',
    authorizedFTE: 1,
    orgUnitId: '2',
    plantillaNumber: 'PL-0101',
    status: 'filled',
    itemNumber: 'EXEC-2024-001',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2023-01-15',
  },

  {
    id: 'p-3',
    code: 'POS-EXEC-002',
    title: 'Executive Assistant to the Secretary',
    salaryGrade: 'SG-27',
    authorizedFTE: 1,
    orgUnitId: '2',
    plantillaNumber: 'PL-0102',
    status: 'filled',
    itemNumber: 'EXEC-2024-002',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-02-01',
  },

  // ==================== FINANCE & BUDGET OFFICE ====================
  {
    id: 'p-4',
    code: 'POS-FBO-001',
    title: 'Director, Finance & Budget Office',
    salaryGrade: 'SG-29',
    authorizedFTE: 1,
    orgUnitId: '3',
    plantillaNumber: 'PL-0201',
    status: 'filled',
    itemNumber: 'FBO-2024-001',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2022-08-20',
  },

  // ==================== ACCOUNTING DIVISION ====================
  {
    id: 'p-5',
    code: 'POS-ACCT-001',
    title: 'Chief, Accounting Division',
    salaryGrade: 'SG-26',
    authorizedFTE: 1,
    orgUnitId: '4',
    plantillaNumber: 'PL-0301',
    status: 'filled',
    itemNumber: 'ACCT-2024-001',
    stepIncrement: 3,
    isPlantilla: true,
    effectiveDate: '2021-03-10',
  },

  {
    id: 'p-6',
    code: 'POS-ACCT-002',
    title: 'Senior Accountant I',
    salaryGrade: 'SG-20',
    authorizedFTE: 1,
    orgUnitId: '4',
    plantillaNumber: 'PL-0302',
    status: 'filled',
    itemNumber: 'ACCT-2024-002',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2021-05-15',
  },

  {
    id: 'p-7',
    code: 'POS-ACCT-003',
    title: 'Accountant III',
    salaryGrade: 'SG-18',
    authorizedFTE: 2,
    orgUnitId: '4',
    plantillaNumber: 'PL-0303',
    status: 'filled',
    itemNumber: 'ACCT-2024-003',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-07-01',
  },

  {
    id: 'p-8',
    code: 'POS-ACCT-004',
    title: 'Accounting Clerk IV',
    salaryGrade: 'SG-12',
    authorizedFTE: 2,
    orgUnitId: '4',
    plantillaNumber: 'PL-0304',
    status: 'vacant',
    itemNumber: 'ACCT-2024-004',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2024-01-01',
  },

  // ==================== BUDGET & DISBURSEMENT DIVISION ====================
  {
    id: 'p-9',
    code: 'POS-BDD-001',
    title: 'Chief, Budget & Disbursement Division',
    salaryGrade: 'SG-26',
    authorizedFTE: 1,
    orgUnitId: '5',
    plantillaNumber: 'PL-0401',
    status: 'filled',
    itemNumber: 'BDD-2024-001',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2022-01-20',
  },

  {
    id: 'p-10',
    code: 'POS-BDD-002',
    title: 'Budget Officer III',
    salaryGrade: 'SG-21',
    authorizedFTE: 1,
    orgUnitId: '5',
    plantillaNumber: 'PL-0402',
    status: 'filled',
    itemNumber: 'BDD-2024-002',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-09-01',
  },

  {
    id: 'p-11',
    code: 'POS-BDD-003',
    title: 'Disbursement Officer II',
    salaryGrade: 'SG-19',
    authorizedFTE: 2,
    orgUnitId: '5',
    plantillaNumber: 'PL-0403',
    status: 'filled',
    itemNumber: 'BDD-2024-003',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-06-15',
  },

  // ==================== HUMAN RESOURCES DEVELOPMENT OFFICE ====================
  {
    id: 'p-12',
    code: 'POS-HRDO-001',
    title: 'Director, Human Resources Development Office',
    salaryGrade: 'SG-29',
    authorizedFTE: 1,
    orgUnitId: '6',
    plantillaNumber: 'PL-0501',
    status: 'filled',
    itemNumber: 'HRDO-2024-001',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2021-11-10',
  },

  // ==================== RECRUITMENT & PLACEMENT DIVISION ====================
  {
    id: 'p-13',
    code: 'POS-RPD-001',
    title: 'Chief, Recruitment & Placement Division',
    salaryGrade: 'SG-26',
    authorizedFTE: 1,
    orgUnitId: '7',
    plantillaNumber: 'PL-0601',
    status: 'filled',
    itemNumber: 'RPD-2024-001',
    stepIncrement: 3,
    isPlantilla: true,
    effectiveDate: '2020-04-15',
  },

  {
    id: 'p-14',
    code: 'POS-RPD-002',
    title: 'Recruitment & Placement Officer II',
    salaryGrade: 'SG-21',
    authorizedFTE: 2,
    orgUnitId: '7',
    plantillaNumber: 'PL-0602',
    status: 'filled',
    itemNumber: 'RPD-2024-002',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-01-10',
  },

  // ==================== EMPLOYEE RELATIONS & WELFARE DIVISION ====================
  {
    id: 'p-15',
    code: 'POS-ERWD-001',
    title: 'Chief, Employee Relations & Welfare Division',
    salaryGrade: 'SG-26',
    authorizedFTE: 1,
    orgUnitId: '8',
    plantillaNumber: 'PL-0701',
    status: 'filled',
    itemNumber: 'ERWD-2024-001',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2021-09-20',
  },

  {
    id: 'p-16',
    code: 'POS-ERWD-002',
    title: 'Employee Relations Officer III',
    salaryGrade: 'SG-21',
    authorizedFTE: 1,
    orgUnitId: '8',
    plantillaNumber: 'PL-0702',
    status: 'filled',
    itemNumber: 'ERWD-2024-002',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-03-15',
  },

  // ==================== LEARNING & DEVELOPMENT DIVISION ====================
  {
    id: 'p-17',
    code: 'POS-LDD-001',
    title: 'Chief, Learning & Development Division',
    salaryGrade: 'SG-26',
    authorizedFTE: 1,
    orgUnitId: '9',
    plantillaNumber: 'PL-0801',
    status: 'filled',
    itemNumber: 'LDD-2024-001',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2022-05-01',
  },

  {
    id: 'p-18',
    code: 'POS-LDD-002',
    title: 'Training Specialist III',
    salaryGrade: 'SG-20',
    authorizedFTE: 2,
    orgUnitId: '9',
    plantillaNumber: 'PL-0802',
    status: 'filled',
    itemNumber: 'LDD-2024-002',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-02-20',
  },

  // ==================== PLANNING & OPERATIONS OFFICE ====================
  {
    id: 'p-19',
    code: 'POS-POO-001',
    title: 'Director, Planning & Operations Office',
    salaryGrade: 'SG-29',
    authorizedFTE: 1,
    orgUnitId: '10',
    plantillaNumber: 'PL-0901',
    status: 'filled',
    itemNumber: 'POO-2024-001',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2022-03-10',
  },

  // ==================== STRATEGIC PLANNING DIVISION ====================
  {
    id: 'p-20',
    code: 'POS-SPD-001',
    title: 'Chief, Strategic Planning Division',
    salaryGrade: 'SG-26',
    authorizedFTE: 1,
    orgUnitId: '11',
    plantillaNumber: 'PL-1001',
    status: 'filled',
    itemNumber: 'SPD-2024-001',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2021-07-15',
  },

  {
    id: 'p-21',
    code: 'POS-SPD-002',
    title: 'Planning Officer III',
    salaryGrade: 'SG-21',
    authorizedFTE: 2,
    orgUnitId: '11',
    plantillaNumber: 'PL-1002',
    status: 'filled',
    itemNumber: 'SPD-2024-002',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-04-01',
  },

  // ==================== OPERATIONS MANAGEMENT DIVISION ====================
  {
    id: 'p-22',
    code: 'POS-OMD-001',
    title: 'Chief, Operations Management Division',
    salaryGrade: 'SG-26',
    authorizedFTE: 1,
    orgUnitId: '12',
    plantillaNumber: 'PL-1101',
    status: 'filled',
    itemNumber: 'OMD-2024-001',
    stepIncrement: 3,
    isPlantilla: true,
    effectiveDate: '2020-08-20',
  },

  {
    id: 'p-23',
    code: 'POS-OMD-002',
    title: 'Operations Officer III',
    salaryGrade: 'SG-21',
    authorizedFTE: 2,
    orgUnitId: '12',
    plantillaNumber: 'PL-1102',
    status: 'filled',
    itemNumber: 'OMD-2024-002',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2023-05-10',
  },

  // ==================== COMPLIANCE & LEGAL OFFICE ====================
  {
    id: 'p-24',
    code: 'POS-CLO-001',
    title: 'Director, Compliance & Legal Office',
    salaryGrade: 'SG-29',
    authorizedFTE: 1,
    orgUnitId: '13',
    plantillaNumber: 'PL-1201',
    status: 'filled',
    itemNumber: 'CLO-2024-001',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-01-10',
  },

  // ==================== LEGAL SERVICES DIVISION ====================
  {
    id: 'p-25',
    code: 'POS-LSD-001',
    title: 'Chief, Legal Services Division',
    salaryGrade: 'SG-26',
    authorizedFTE: 1,
    orgUnitId: '14',
    plantillaNumber: 'PL-1301',
    status: 'filled',
    itemNumber: 'LSD-2024-001',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2022-09-15',
  },

  {
    id: 'p-26',
    code: 'POS-LSD-002',
    title: 'Attorney III',
    salaryGrade: 'SG-22',
    authorizedFTE: 2,
    orgUnitId: '14',
    plantillaNumber: 'PL-1302',
    status: 'filled',
    itemNumber: 'LSD-2024-002',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-08-01',
  },

  // ==================== COMPLIANCE & RISK MANAGEMENT DIVISION ====================
  {
    id: 'p-27',
    code: 'POS-CRMD-001',
    title: 'Chief, Compliance & Risk Management Division',
    salaryGrade: 'SG-26',
    authorizedFTE: 1,
    orgUnitId: '15',
    plantillaNumber: 'PL-1401',
    status: 'filled',
    itemNumber: 'CRMD-2024-001',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-02-20',
  },

  // ==================== INFORMATION & COMMUNICATIONS TECHNOLOGY OFFICE ====================
  {
    id: 'p-28',
    code: 'POS-ICTO-001',
    title: 'Director, Information & Communications Technology Office',
    salaryGrade: 'SG-29',
    authorizedFTE: 1,
    orgUnitId: '16',
    plantillaNumber: 'PL-1501',
    status: 'filled',
    itemNumber: 'ICTO-2024-001',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2021-12-01',
  },

  // ==================== SYSTEMS & APPLICATIONS DIVISION ====================
  {
    id: 'p-29',
    code: 'POS-SAD-001',
    title: 'Chief, Systems & Applications Division',
    salaryGrade: 'SG-26',
    authorizedFTE: 1,
    orgUnitId: '17',
    plantillaNumber: 'PL-1601',
    status: 'filled',
    itemNumber: 'SAD-2024-001',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2022-02-10',
  },

  {
    id: 'p-30',
    code: 'POS-SAD-002',
    title: 'Systems Analyst III',
    salaryGrade: 'SG-22',
    authorizedFTE: 2,
    orgUnitId: '17',
    plantillaNumber: 'PL-1602',
    status: 'filled',
    itemNumber: 'SAD-2024-002',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-03-01',
  },

  {
    id: 'p-31',
    code: 'POS-SAD-003',
    title: 'Programmer/Analyst II',
    salaryGrade: 'SG-19',
    authorizedFTE: 3,
    orgUnitId: '17',
    plantillaNumber: 'PL-1603',
    status: 'filled',
    itemNumber: 'SAD-2024-003',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-06-15',
  },

  // ==================== INFRASTRUCTURE & SUPPORT SERVICES DIVISION ====================
  {
    id: 'p-32',
    code: 'POS-ISSD-001',
    title: 'Chief, Infrastructure & Support Services Division',
    salaryGrade: 'SG-26',
    authorizedFTE: 1,
    orgUnitId: '18',
    plantillaNumber: 'PL-1701',
    status: 'filled',
    itemNumber: 'ISSD-2024-001',
    stepIncrement: 2,
    isPlantilla: true,
    effectiveDate: '2021-06-20',
  },

  {
    id: 'p-33',
    code: 'POS-ISSD-002',
    title: 'IT Support Officer II',
    salaryGrade: 'SG-18',
    authorizedFTE: 2,
    orgUnitId: '18',
    plantillaNumber: 'PL-1702',
    status: 'filled',
    itemNumber: 'ISSD-2024-002',
    stepIncrement: 1,
    isPlantilla: true,
    effectiveDate: '2023-07-01',
  },

  // ==================== JOB ORDER (JO) POSITIONS ====================
  {
    id: 'p-34',
    code: 'POS-JO-001',
    title: 'Project Consultant - Infrastructure Development',
    salaryGrade: 'SG-14',
    authorizedFTE: 1,
    orgUnitId: '3',
    status: 'filled',
    itemNumber: '',
    stepIncrement: 1,
    isPlantilla: false,
    effectiveDate: '2024-01-15',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },

  {
    id: 'p-35',
    code: 'POS-JO-002',
    title: 'Data Entry Specialist (JO)',
    salaryGrade: 'SG-5',
    authorizedFTE: 2,
    orgUnitId: '4',
    status: 'filled',
    itemNumber: '',
    stepIncrement: 1,
    isPlantilla: false,
    effectiveDate: '2024-02-01',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },

  {
    id: 'p-36',
    code: 'POS-JO-003',
    title: 'Event Coordinator (JO)',
    salaryGrade: 'SG-9',
    authorizedFTE: 1,
    orgUnitId: '2',
    status: 'vacant',
    itemNumber: '',
    stepIncrement: 1,
    isPlantilla: false,
    effectiveDate: '2024-01-20',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },

  // ==================== COS/CONSULTANCY POSITIONS ====================
  {
    id: 'p-37',
    code: 'POS-COS-001',
    title: 'Subject Matter Expert - Policy Development',
    salaryGrade: 'SG-20',
    authorizedFTE: 1,
    orgUnitId: '5',
    status: 'filled',
    itemNumber: '',
    stepIncrement: 1,
    isPlantilla: false,
    effectiveDate: '2023-09-01',
    createdAt: '2023-09-01',
    updatedAt: '2023-09-01',
  },

  {
    id: 'p-38',
    code: 'POS-COS-002',
    title: 'International Consultant - Technology Transfer',
    salaryGrade: 'SG-22',
    authorizedFTE: 1,
    orgUnitId: '16',
    status: 'filled',
    itemNumber: '',
    stepIncrement: 1,
    isPlantilla: false,
    effectiveDate: '2023-11-15',
    createdAt: '2023-11-15',
    updatedAt: '2023-11-15',
  },

  {
    id: 'p-39',
    code: 'POS-COS-003',
    title: 'Research Consultant - Market Analysis',
    salaryGrade: 'SG-15',
    authorizedFTE: 1,
    orgUnitId: '3',
    status: 'vacant',
    itemNumber: '',
    stepIncrement: 1,
    isPlantilla: false,
    effectiveDate: '2024-01-10',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  },
]

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms))

export async function fetchPositionsByOrgUnit(orgUnitId: string): Promise<Position[]> {
  await delay()
  return POS_DB.filter((p) => p.orgUnitId === orgUnitId).map((p) => ({ ...p }))
}

export async function fetchAllPositions(): Promise<Position[]> {
  await delay()
  return POS_DB.map((p) => ({ ...p }))
}

export async function fetchPositionById(id: string): Promise<Position | null> {
  await delay()
  const found = POS_DB.find((p) => p.id === id) ?? null
  return found ? { ...found } : null
}

export async function createPosition(position: Omit<Position, 'id'>): Promise<Position> {
  await delay()
  const id = `p-${Math.random().toString(36).slice(2, 9)}`
  const newPos: Position = { id, ...position }
  POS_DB.push(newPos)
  return { ...newPos }
}

export async function updatePosition(id: string, updates: Partial<Position>): Promise<Position | null> {
  await delay()
  POS_DB = POS_DB.map((p) => (p.id === id ? { ...p, ...updates } : p))
  const updated = POS_DB.find((p) => p.id === id) ?? null
  return updated ? { ...updated } : null
}

export async function deletePosition(id: string): Promise<boolean> {
  await delay()
  const exists = POS_DB.some((p) => p.id === id)
  if (!exists) return false
  POS_DB = POS_DB.filter((p) => p.id !== id)
  return true
}

export function __resetPositions() {
  POS_DB = [
    {
      id: 'p-1',
      code: 'POS-OSEC-001',
      title: 'Secretary of the Agency',
      salaryGrade: 'SG-24',
      authorizedFTE: 1,
      orgUnitId: '1',
      plantillaNumber: 'PL-0001',
      status: 'filled',
      stepIncrement: 1,
      isPlantilla: true,
    },
    {
      id: 'p-2',
      code: 'POS-FIN-001',
      title: 'Chief Accountant',
      salaryGrade: 'SG-18',
      authorizedFTE: 1,
      orgUnitId: '2',
      plantillaNumber: 'PL-0101',
      status: 'filled',
      stepIncrement: 1,
      isPlantilla: true,
    },
    {
      id: 'p-3',
      code: 'POS-HR-001',
      title: 'HR Manager',
      salaryGrade: 'SG-18',
      authorizedFTE: 1,
      orgUnitId: '3',
      plantillaNumber: 'PL-0201',
      status: 'vacant',
      stepIncrement: 1,
      isPlantilla: true,
    },
  ]
}

// Synchronous getter for direct access (needed for PMT generation and other sync contexts)
export function getPositions(): Position[] {
  return POS_DB.map((p) => ({ ...p }))
}