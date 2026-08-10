export type User = {
  id: string
  firstName: string
  middleName?: string
  lastName: string
  nameSuffix?: string
  email: string
  employeeNumber: string
  // Government IDs
  tin?: string
  gsis?: string
  philhealth?: string
  pagibig?: string
  // Account Status
  accountStatus: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

let USER_DB: User[] = [
  {
    id: 'usr-001',
    firstName: 'Maria',
    middleName: 'Santos',
    lastName: 'Reyes',
    nameSuffix: '',
    email: 'maria.santos@agency.gov.ph',
    employeeNumber: 'EMP-001001',
    tin: '123-456-789-000',
    gsis: '200012345601',
    philhealth: '100012345601',
    pagibig: '100012345601',
    accountStatus: 'active',
    createdAt: '2022-06-30',
    updatedAt: '2024-01-15',
  },
  {
    id: 'usr-002',
    firstName: 'Roberto',
    middleName: 'Cruz',
    lastName: 'Fernandez',
    nameSuffix: '',
    email: 'roberto.cruz@agency.gov.ph',
    employeeNumber: 'EMP-002001',
    tin: '234-567-890-111',
    gsis: '200012345602',
    philhealth: '100012345602',
    pagibig: '100012345602',
    accountStatus: 'active',
    createdAt: '2023-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'usr-003',
    firstName: 'Jaime',
    middleName: 'Villar',
    lastName: 'Gutierrez',
    nameSuffix: 'Jr.',
    email: 'jaime.gutierrez@agency.gov.ph',
    employeeNumber: 'EMP-003001',
    tin: '345-678-901-222',
    gsis: '200012345603',
    philhealth: '100012345603',
    pagibig: '100012345603',
    accountStatus: 'active',
    createdAt: '2023-03-20',
    updatedAt: '2024-01-15',
  },
  {
    id: 'usr-004',
    firstName: 'Angela',
    middleName: 'Grace',
    lastName: 'Mercado',
    nameSuffix: '',
    email: 'angela.mercado@agency.gov.ph',
    employeeNumber: 'EMP-004001',
    tin: '456-789-012-333',
    gsis: '200012345604',
    philhealth: '100012345604',
    pagibig: '100012345604',
    accountStatus: 'active',
    createdAt: '2023-05-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'usr-005',
    firstName: 'Carlos',
    middleName: 'Manuel',
    lastName: 'Pascual',
    nameSuffix: '',
    email: 'carlos.pascual@agency.gov.ph',
    employeeNumber: 'EMP-005001',
    tin: '567-890-123-444',
    gsis: '200012345605',
    philhealth: '100012345605',
    pagibig: '100012345605',
    accountStatus: 'active',
    createdAt: '2023-07-25',
    updatedAt: '2024-01-15',
  },
  {
    id: 'usr-006',
    firstName: 'Elena',
    middleName: 'Rose',
    lastName: 'Gonzales',
    nameSuffix: '',
    email: 'elena.gonzales@agency.gov.ph',
    employeeNumber: 'EMP-006001',
    tin: '678-901-234-555',
    gsis: '200012345606',
    philhealth: '100012345606',
    pagibig: '100012345606',
    accountStatus: 'active',
    createdAt: '2023-09-12',
    updatedAt: '2024-01-15',
  },
  {
    id: 'usr-007',
    firstName: 'Fernando',
    middleName: 'Jose',
    lastName: 'Ramos',
    nameSuffix: '',
    email: 'fernando.ramos@agency.gov.ph',
    employeeNumber: 'EMP-007001',
    tin: '789-012-345-666',
    gsis: '200012345607',
    philhealth: '100012345607',
    pagibig: '100012345607',
    accountStatus: 'pending',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'usr-008',
    firstName: 'Grace',
    middleName: 'Anne',
    lastName: 'Villanueva',
    nameSuffix: '',
    email: 'grace.villanueva@agency.gov.ph',
    employeeNumber: 'EMP-008001',
    tin: '890-123-456-777',
    gsis: '200012345608',
    philhealth: '100012345608',
    pagibig: '100012345608',
    accountStatus: 'active',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-15',
  },
]

export async function fetchAllUsers(): Promise<User[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(USER_DB)
    }, 100)
  })
}

export async function fetchUserById(id: string): Promise<User | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = USER_DB.find((u) => u.id === id)
      resolve(user || null)
    }, 100)
  })
}

export async function fetchActiveUsers(): Promise<User[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(USER_DB.filter((u) => u.accountStatus === 'active'))
    }, 100)
  })
}

export function getUserDisplayName(user: User): string {
  const name = [user.firstName, user.middleName, user.lastName, user.nameSuffix]
    .filter(Boolean)
    .join(' ')
  return name
}
