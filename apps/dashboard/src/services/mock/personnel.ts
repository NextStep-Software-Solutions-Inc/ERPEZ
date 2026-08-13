export type Person = {
  id: string
  name: string
  employeeNumber: string
  positionId?: string | null
  startDate?: string | null
  endDate?: string | null
  status: 'active' | 'on-leave' | 'resigned'
  // Government Schema Fields
  employmentStatus: 'Permanent' | 'Casual' | 'Contractual' | 'Coterminous'
  tin?: string
  gsis?: string
  philhealth?: string
  pagibig?: string
  email?: string
}

let PERSON_DB: Person[] = [
  // ==================== OFFICE OF THE SECRETARY ====================
  {
    id: 'u-1',
    name: 'Hon. Maria Santos Reyes',
    employeeNumber: 'EMP-001001',
    positionId: 'p-1',
    startDate: '2022-06-30',
    endDate: null,
    status: 'active',
    employmentStatus: 'Coterminous',
    tin: '123-456-789-000',
    gsis: '200012345601',
    philhealth: '100012345601',
    pagibig: '100012345601',
    email: 'maria.santos@agency.gov.ph',
  },

  // ==================== EXECUTIVE OFFICE ====================
  {
    id: 'u-2',
    name: 'Atty. Roberto Cruz Fernandez',
    employeeNumber: 'EMP-002001',
    positionId: 'p-2',
    startDate: '2023-01-15',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '234-567-890-111',
    gsis: '200012345602',
    philhealth: '100012345602',
    pagibig: '100012345602',
    email: 'roberto.cruz@agency.gov.ph',
  },

  {
    id: 'u-3',
    name: 'Ms. Angela Lorraine Santos',
    employeeNumber: 'EMP-002002',
    positionId: 'p-3',
    startDate: '2023-02-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '345-678-901-222',
    gsis: '200012345603',
    philhealth: '100012345603',
    pagibig: '100012345603',
    email: 'angela.santos@agency.gov.ph',
  },

  // ==================== FINANCE & BUDGET OFFICE ====================
  {
    id: 'u-4',
    name: 'CPA Jose Miguel Gonzales',
    employeeNumber: 'EMP-003001',
    positionId: 'p-4',
    startDate: '2022-08-20',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '456-789-012-333',
    gsis: '200012345604',
    philhealth: '100012345604',
    pagibig: '100012345604',
    email: 'jose.gonzales@agency.gov.ph',
  },

  // ==================== ACCOUNTING DIVISION ====================
  {
    id: 'u-5',
    name: 'CPA Carmen Rosario Mendoza',
    employeeNumber: 'EMP-004001',
    positionId: 'p-5',
    startDate: '2021-03-10',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '567-890-123-444',
    gsis: '200012345605',
    philhealth: '100012345605',
    pagibig: '100012345605',
    email: 'carmen.mendoza@agency.gov.ph',
  },

  {
    id: 'u-6',
    name: 'CPA Danilo Torres Villanueva',
    employeeNumber: 'EMP-004002',
    positionId: 'p-6',
    startDate: '2021-05-15',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '678-901-234-555',
    gsis: '200012345606',
    philhealth: '100012345606',
    pagibig: '100012345606',
    email: 'danilo.torres@agency.gov.ph',
  },

  {
    id: 'u-7',
    name: 'Eliza Marie Rodriguez',
    employeeNumber: 'EMP-004003',
    positionId: 'p-7',
    startDate: '2023-07-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '789-012-345-666',
    gsis: '200012345607',
    philhealth: '100012345607',
    pagibig: '100012345607',
    email: 'eliza.rodriguez@agency.gov.ph',
  },

  {
    id: 'u-8',
    name: 'Francisco De Leon',
    employeeNumber: 'EMP-004004',
    positionId: 'p-7',
    startDate: '2023-07-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '890-123-456-777',
    gsis: '200012345608',
    philhealth: '100012345608',
    pagibig: '100012345608',
    email: 'francisco.deleon@agency.gov.ph',
  },

  // ==================== BUDGET & DISBURSEMENT DIVISION ====================
  {
    id: 'u-9',
    name: 'Atty. Gloria Santos Aquino',
    employeeNumber: 'EMP-005001',
    positionId: 'p-9',
    startDate: '2022-01-20',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '901-234-567-888',
    gsis: '200012345609',
    philhealth: '100012345609',
    pagibig: '100012345609',
    email: 'gloria.aquino@agency.gov.ph',
  },

  {
    id: 'u-10',
    name: 'Herminia Villaruz',
    employeeNumber: 'EMP-005002',
    positionId: 'p-10',
    startDate: '2023-09-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '012-345-678-999',
    gsis: '200012345610',
    philhealth: '100012345610',
    pagibig: '100012345610',
    email: 'herminia.villaruz@agency.gov.ph',
  },

  {
    id: 'u-11',
    name: 'Isabel Roque',
    employeeNumber: 'EMP-005003',
    positionId: 'p-11',
    startDate: '2023-06-15',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '123-456-789-001',
    gsis: '200012345611',
    philhealth: '100012345611',
    pagibig: '100012345611',
    email: 'isabel.roque@agency.gov.ph',
  },

  {
    id: 'u-12',
    name: 'Jerome Reyes',
    employeeNumber: 'EMP-005004',
    positionId: 'p-11',
    startDate: '2023-06-15',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '234-567-890-002',
    gsis: '200012345612',
    philhealth: '100012345612',
    pagibig: '100012345612',
    email: 'jerome.reyes@agency.gov.ph',
  },

  // ==================== HUMAN RESOURCES DEVELOPMENT OFFICE ====================
  {
    id: 'u-13',
    name: 'Dr. Katherine Luna Mercado',
    employeeNumber: 'EMP-006001',
    positionId: 'p-12',
    startDate: '2021-11-10',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '345-678-901-003',
    gsis: '200012345613',
    philhealth: '100012345613',
    pagibig: '100012345613',
    email: 'katherine.mercado@agency.gov.ph',
  },

  // ==================== RECRUITMENT & PLACEMENT DIVISION ====================
  {
    id: 'u-14',
    name: 'Leonor Navarro Flores',
    employeeNumber: 'EMP-007001',
    positionId: 'p-13',
    startDate: '2020-04-15',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '456-789-012-004',
    gsis: '200012345614',
    philhealth: '100012345614',
    pagibig: '100012345614',
    email: 'leonor.flores@agency.gov.ph',
  },

  {
    id: 'u-15',
    name: 'Manuel Perez Ortiz',
    employeeNumber: 'EMP-007002',
    positionId: 'p-14',
    startDate: '2023-01-10',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '567-890-123-005',
    gsis: '200012345615',
    philhealth: '100012345615',
    pagibig: '100012345615',
    email: 'manuel.perez@agency.gov.ph',
  },

  {
    id: 'u-16',
    name: 'Nora Cabrera Santos',
    employeeNumber: 'EMP-007003',
    positionId: 'p-14',
    startDate: '2023-01-10',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '678-901-234-006',
    gsis: '200012345616',
    philhealth: '100012345616',
    pagibig: '100012345616',
    email: 'nora.cabrera@agency.gov.ph',
  },

  // ==================== EMPLOYEE RELATIONS & WELFARE DIVISION ====================
  {
    id: 'u-17',
    name: 'Olivia Valencia Ramirez',
    employeeNumber: 'EMP-008001',
    positionId: 'p-15',
    startDate: '2021-09-20',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '789-012-345-007',
    gsis: '200012345617',
    philhealth: '100012345617',
    pagibig: '100012345617',
    email: 'olivia.ramirez@agency.gov.ph',
  },

  {
    id: 'u-18',
    name: 'Patricia Delgado Morales',
    employeeNumber: 'EMP-008002',
    positionId: 'p-16',
    startDate: '2023-03-15',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '890-123-456-008',
    gsis: '200012345618',
    philhealth: '100012345618',
    pagibig: '100012345618',
    email: 'patricia.delgado@agency.gov.ph',
  },

  // ==================== LEARNING & DEVELOPMENT DIVISION ====================
  {
    id: 'u-19',
    name: 'Queenie Morales Rivera',
    employeeNumber: 'EMP-009001',
    positionId: 'p-17',
    startDate: '2022-05-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '901-234-567-009',
    gsis: '200012345619',
    philhealth: '100012345619',
    pagibig: '100012345619',
    email: 'queenie.rivera@agency.gov.ph',
  },

  {
    id: 'u-20',
    name: 'Raul Estrada Garcia',
    employeeNumber: 'EMP-009002',
    positionId: 'p-18',
    startDate: '2023-02-20',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '012-345-678-010',
    gsis: '200012345620',
    philhealth: '100012345620',
    pagibig: '100012345620',
    email: 'raul.estrada@agency.gov.ph',
  },

  {
    id: 'u-21',
    name: 'Sandra Villegas Cortez',
    employeeNumber: 'EMP-009003',
    positionId: 'p-18',
    startDate: '2023-02-20',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '123-456-789-011',
    gsis: '200012345621',
    philhealth: '100012345621',
    pagibig: '100012345621',
    email: 'sandra.villegas@agency.gov.ph',
  },

  // ==================== PLANNING & OPERATIONS OFFICE ====================
  {
    id: 'u-22',
    name: 'Tomas Rivera Gutierrez',
    employeeNumber: 'EMP-010001',
    positionId: 'p-19',
    startDate: '2022-03-10',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '234-567-890-012',
    gsis: '200012345622',
    philhealth: '100012345622',
    pagibig: '100012345622',
    email: 'tomas.rivera@agency.gov.ph',
  },

  // ==================== STRATEGIC PLANNING DIVISION ====================
  {
    id: 'u-23',
    name: 'Ursula Lopez Fernandez',
    employeeNumber: 'EMP-011001',
    positionId: 'p-20',
    startDate: '2021-07-15',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '345-678-901-013',
    gsis: '200012345623',
    philhealth: '100012345623',
    pagibig: '100012345623',
    email: 'ursula.lopez@agency.gov.ph',
  },

  {
    id: 'u-24',
    name: 'Vicente Romero Valdez',
    employeeNumber: 'EMP-011002',
    positionId: 'p-21',
    startDate: '2023-04-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '456-789-012-014',
    gsis: '200012345624',
    philhealth: '100012345624',
    pagibig: '100012345624',
    email: 'vicente.romero@agency.gov.ph',
  },

  {
    id: 'u-25',
    name: 'Wanda Santos Borja',
    employeeNumber: 'EMP-011003',
    positionId: 'p-21',
    startDate: '2023-04-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '567-890-123-015',
    gsis: '200012345625',
    philhealth: '100012345625',
    pagibig: '100012345625',
    email: 'wanda.borja@agency.gov.ph',
  },

  // ==================== OPERATIONS MANAGEMENT DIVISION ====================
  {
    id: 'u-26',
    name: 'Xavier Montoya Lara',
    employeeNumber: 'EMP-012001',
    positionId: 'p-22',
    startDate: '2020-08-20',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '678-901-234-016',
    gsis: '200012345626',
    philhealth: '100012345626',
    pagibig: '100012345626',
    email: 'xavier.montoya@agency.gov.ph',
  },

  {
    id: 'u-27',
    name: 'Yolanda Diaz Moreno',
    employeeNumber: 'EMP-012002',
    positionId: 'p-23',
    startDate: '2023-05-10',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '789-012-345-017',
    gsis: '200012345627',
    philhealth: '100012345627',
    pagibig: '100012345627',
    email: 'yolanda.diaz@agency.gov.ph',
  },

  {
    id: 'u-28',
    name: 'Zenaida Flores Reyes',
    employeeNumber: 'EMP-012003',
    positionId: 'p-23',
    startDate: '2023-05-10',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '890-123-456-018',
    gsis: '200012345628',
    philhealth: '100012345628',
    pagibig: '100012345628',
    email: 'zenaida.flores@agency.gov.ph',
  },

  // ==================== COMPLIANCE & LEGAL OFFICE ====================
  {
    id: 'u-29',
    name: 'Atty. Antonio Ramos Callejo',
    employeeNumber: 'EMP-013001',
    positionId: 'p-24',
    startDate: '2023-01-10',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '901-234-567-019',
    gsis: '200012345629',
    philhealth: '100012345629',
    pagibig: '100012345629',
    email: 'antonio.ramos@agency.gov.ph',
  },

  // ==================== LEGAL SERVICES DIVISION ====================
  {
    id: 'u-30',
    name: 'Atty. Beatriz Lopez Gonzales',
    employeeNumber: 'EMP-014001',
    positionId: 'p-25',
    startDate: '2022-09-15',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '012-345-678-020',
    gsis: '200012345630',
    philhealth: '100012345630',
    pagibig: '100012345630',
    email: 'beatriz.lopez@agency.gov.ph',
  },

  {
    id: 'u-31',
    name: 'Atty. Carlos Domingo Reyes',
    employeeNumber: 'EMP-014002',
    positionId: 'p-26',
    startDate: '2023-08-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '123-456-789-021',
    gsis: '200012345631',
    philhealth: '100012345631',
    pagibig: '100012345631',
    email: 'carlos.reyes@agency.gov.ph',
  },

  {
    id: 'u-32',
    name: 'Atty. Delia Martinez Santos',
    employeeNumber: 'EMP-014003',
    positionId: 'p-26',
    startDate: '2023-08-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '234-567-890-022',
    gsis: '200012345632',
    philhealth: '100012345632',
    pagibig: '100012345632',
    email: 'delia.martinez@agency.gov.ph',
  },

  // ==================== COMPLIANCE & RISK MANAGEMENT DIVISION ====================
  {
    id: 'u-33',
    name: 'Eunice Navarro Castillo',
    employeeNumber: 'EMP-015001',
    positionId: 'p-27',
    startDate: '2023-02-20',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '345-678-901-023',
    gsis: '200012345633',
    philhealth: '100012345633',
    pagibig: '100012345633',
    email: 'eunice.navarro@agency.gov.ph',
  },

  // ==================== INFORMATION & COMMUNICATIONS TECHNOLOGY OFFICE ====================
  {
    id: 'u-34',
    name: 'Engr. Fernando Peralta',
    employeeNumber: 'EMP-016001',
    positionId: 'p-28',
    startDate: '2021-12-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '456-789-012-024',
    gsis: '200012345634',
    philhealth: '100012345634',
    pagibig: '100012345634',
    email: 'fernando.peralta@agency.gov.ph',
  },

  // ==================== SYSTEMS & APPLICATIONS DIVISION ====================
  {
    id: 'u-35',
    name: 'Gregorio Padilla Aguilar',
    employeeNumber: 'EMP-017001',
    positionId: 'p-29',
    startDate: '2022-02-10',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '567-890-123-025',
    gsis: '200012345635',
    philhealth: '100012345635',
    pagibig: '100012345635',
    email: 'gregorio.padilla@agency.gov.ph',
  },

  {
    id: 'u-36',
    name: 'Helen Vargas Soriano',
    employeeNumber: 'EMP-017002',
    positionId: 'p-30',
    startDate: '2023-03-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '678-901-234-026',
    gsis: '200012345636',
    philhealth: '100012345636',
    pagibig: '100012345636',
    email: 'helen.vargas@agency.gov.ph',
  },

  {
    id: 'u-37',
    name: 'Ignacio Torres Hernandez',
    employeeNumber: 'EMP-017003',
    positionId: 'p-30',
    startDate: '2023-03-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '789-012-345-027',
    gsis: '200012345637',
    philhealth: '100012345637',
    pagibig: '100012345637',
    email: 'ignacio.torres@agency.gov.ph',
  },

  {
    id: 'u-38',
    name: 'Jerome Lim',
    employeeNumber: 'EMP-017004',
    positionId: 'p-31',
    startDate: '2023-06-15',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '890-123-456-028',
    gsis: '200012345638',
    philhealth: '100012345638',
    pagibig: '100012345638',
    email: 'jerome.lim@agency.gov.ph',
  },

  {
    id: 'u-39',
    name: 'Kimberly Santos',
    employeeNumber: 'EMP-017005',
    positionId: 'p-31',
    startDate: '2023-06-15',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '901-234-567-029',
    gsis: '200012345639',
    philhealth: '100012345639',
    pagibig: '100012345639',
    email: 'kimberly.santos@agency.gov.ph',
  },

  {
    id: 'u-40',
    name: 'Luis Fernandez',
    employeeNumber: 'EMP-017006',
    positionId: 'p-31',
    startDate: '2023-06-15',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '012-345-678-030',
    gsis: '200012345640',
    philhealth: '100012345640',
    pagibig: '100012345640',
    email: 'luis.fernandez@agency.gov.ph',
  },

  // ==================== INFRASTRUCTURE & SUPPORT SERVICES DIVISION ====================
  {
    id: 'u-41',
    name: 'Marcia Valenzuela Gutierrez',
    employeeNumber: 'EMP-018001',
    positionId: 'p-32',
    startDate: '2021-06-20',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '123-456-789-031',
    gsis: '200012345641',
    philhealth: '100012345641',
    pagibig: '100012345641',
    email: 'marcia.valenzuela@agency.gov.ph',
  },

  {
    id: 'u-42',
    name: 'Nestor Camarão',
    employeeNumber: 'EMP-018002',
    positionId: 'p-33',
    startDate: '2023-07-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '234-567-890-032',
    gsis: '200012345642',
    philhealth: '100012345642',
    pagibig: '100012345642',
    email: 'nestor.camarao@agency.gov.ph',
  },

  {
    id: 'u-43',
    name: 'Olivia Bernardo',
    employeeNumber: 'EMP-018003',
    positionId: 'p-33',
    startDate: '2023-07-01',
    endDate: null,
    status: 'active',
    employmentStatus: 'Permanent',
    tin: '345-678-901-033',
    gsis: '200012345643',
    philhealth: '100012345643',
    pagibig: '100012345643',
    email: 'olivia.bernardo@agency.gov.ph',
  },
]

const delay = (ms = 200) => new Promise((res) => setTimeout(res, ms))

export async function fetchPersonnel(): Promise<Person[]> {
  await delay()
  return PERSON_DB.map((p) => ({ ...p }))
}

export async function fetchPersonnelByPosition(positionId: string): Promise<Person[]> {
  await delay()
  return PERSON_DB.filter((p) => p.positionId === positionId).map((p) => ({ ...p }))
}

export async function createPerson(person: Omit<Person, 'id'>): Promise<Person> {
  await delay()
  const id = `u-${Math.random().toString(36).slice(2, 9)}`
  const newPerson: Person = { id, ...person }
  PERSON_DB.push(newPerson)
  return { ...newPerson }
}

export async function updatePerson(id: string, updates: Partial<Person>): Promise<Person | null> {
  await delay()
  PERSON_DB = PERSON_DB.map((p) => (p.id === id ? { ...p, ...updates } : p))
  const updated = PERSON_DB.find((p) => p.id === id) ?? null
  return updated ? { ...updated } : null
}

export async function deletePerson(id: string): Promise<boolean> {
  await delay()
  const exists = PERSON_DB.some((p) => p.id === id)
  if (!exists) return false
  PERSON_DB = PERSON_DB.filter((p) => p.id !== id)
  return true
}

export function __resetPersonnel() {
  PERSON_DB = [
    {
      id: 'u-1',
      name: 'Atty. Maria Santos',
      employeeNumber: 'EMP-1001',
      positionId: 'p-1',
      startDate: '2019-07-01',
      endDate: null,
      status: 'active',
      employmentStatus: 'Permanent',
    },
    {
      id: 'u-2',
      name: 'John Dela Cruz',
      employeeNumber: 'EMP-2002',
      positionId: 'p-2',
      startDate: '2021-01-10',
      endDate: null,
      status: 'active',
      employmentStatus: 'Permanent',
    },
  ]
}

// Synchronous getter for direct access (needed for PMT generation and other sync contexts)
export function getPersonnel(): Person[] {
  return PERSON_DB
}