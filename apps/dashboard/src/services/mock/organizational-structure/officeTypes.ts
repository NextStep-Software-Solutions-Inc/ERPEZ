import type { OfficeTypeSetting } from '@/components/features/planning/organizational-structure/types'

/**
 * Office Types Database
 * Defines the different types/classifications of organizational units
 * Examples: Office, Division, Section, Department, Bureau, Service, Center, Unit
 */
export let OFFICE_TYPES_DB: OfficeTypeSetting[] = [
  {
    id: 'ot-1',
    name: 'Office',
    code: 'OFF',
    description: 'Standard organizational office - lowest level unit',
    status: 'active',
    canHaveChildren: true,
    allowedCategories: ['executive', 'administrative', 'technical', 'support', 'oversight', 'delivery', 'regulatory'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'ot-2',
    name: 'Division',
    code: 'DIV',
    description: 'Major organizational unit - can contain offices and sections',
    status: 'active',
    canHaveChildren: true,
    allowedCategories: ['executive', 'administrative', 'technical', 'delivery', 'regulatory', 'oversight'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'ot-3',
    name: 'Section',
    code: 'SEC',
    description: 'Sub-division unit - cannot have child units',
    status: 'active',
    canHaveChildren: false,
    allowedCategories: ['administrative', 'technical', 'support', 'delivery'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'ot-4',
    name: 'Department',
    code: 'DEPT',
    description: 'Department level - major functional grouping',
    status: 'active',
    canHaveChildren: true,
    allowedCategories: ['executive', 'administrative', 'technical', 'delivery', 'regulatory'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ot-5',
    name: 'Bureau',
    code: 'BURE',
    description: 'Bureau level - highest organizational unit',
    status: 'active',
    canHaveChildren: true,
    allowedCategories: ['executive', 'regulatory', 'oversight'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ot-6',
    name: 'Service',
    code: 'SERV',
    description: 'Service level - service delivery organization',
    status: 'active',
    canHaveChildren: true,
    allowedCategories: ['delivery', 'technical', 'administrative'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ot-7',
    name: 'Center',
    code: 'CTR',
    description: 'Center level - specialized facility or function center',
    status: 'active',
    canHaveChildren: false,
    allowedCategories: ['technical', 'delivery', 'support'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ot-8',
    name: 'Unit',
    code: 'UNIT',
    description: 'Unit level - smallest functional grouping',
    status: 'active',
    canHaveChildren: false,
    allowedCategories: ['administrative', 'technical', 'support', 'delivery'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
]

/**
 * Fetch all office types
 */
export async function fetchOfficeTypes(): Promise<OfficeTypeSetting[]> {
  return OFFICE_TYPES_DB
}

/**
 * Fetch office type by ID
 */
export async function fetchOfficeTypeById(id: string): Promise<OfficeTypeSetting | null> {
  return OFFICE_TYPES_DB.find((type) => type.id === id) || null
}

/**
 * Create new office type
 */
export async function createOfficeType(data: Omit<OfficeTypeSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeTypeSetting> {
  const newType: OfficeTypeSetting = {
    ...data,
    id: `ot-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  OFFICE_TYPES_DB.push(newType)
  return newType
}

/**
 * Update office type
 */
export async function updateOfficeType(id: string, data: Partial<OfficeTypeSetting>): Promise<OfficeTypeSetting | null> {
  const index = OFFICE_TYPES_DB.findIndex((type) => type.id === id)
  if (index === -1) return null
  
  OFFICE_TYPES_DB[index] = {
    ...OFFICE_TYPES_DB[index],
    ...data,
    id: OFFICE_TYPES_DB[index].id,
    createdAt: OFFICE_TYPES_DB[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  return OFFICE_TYPES_DB[index]
}

/**
 * Delete office type
 */
export async function deleteOfficeType(id: string): Promise<boolean> {
  const index = OFFICE_TYPES_DB.findIndex((type) => type.id === id)
  if (index === -1) return false
  OFFICE_TYPES_DB.splice(index, 1)
  return true
}
