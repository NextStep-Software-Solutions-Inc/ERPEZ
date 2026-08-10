import type { OfficeCategorySetting } from '@/components/features/planning/organizational-structure/types'

/**
 * Office Categories Database
 * Defines the functional categories/classifications for offices
 * Examples: Administrative, Technical, Delivery, Executive, Regulatory, Support, Oversight
 */
export let OFFICE_CATEGORIES_DB: OfficeCategorySetting[] = [
  {
    id: 'oc-1',
    name: 'Administrative',
    code: 'ADMIN',
    description: 'Administrative and support functions - handles internal operations',
    status: 'active',
    officeType: 'office',
    budgetingApproach: 'cost-center',
    requiresCluster: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'oc-2',
    name: 'Technical',
    code: 'TECH',
    description: 'Technical and operational units - manages specialized operations',
    status: 'active',
    officeType: 'division',
    budgetingApproach: 'responsibility-center',
    requiresCluster: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'oc-3',
    name: 'Delivery',
    code: 'DELIV',
    description: 'Service delivery units - provides services to stakeholders',
    status: 'active',
    officeType: 'division',
    budgetingApproach: 'responsibility-center',
    requiresCluster: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'oc-4',
    name: 'Executive',
    code: 'EXEC',
    description: 'Executive management level - leadership and strategic decisions',
    status: 'active',
    officeType: 'department',
    budgetingApproach: 'responsibility-center',
    requiresCluster: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'oc-5',
    name: 'Regulatory',
    code: 'REG',
    description: 'Regulatory and compliance - ensures adherence to policies',
    status: 'active',
    officeType: 'bureau',
    budgetingApproach: 'responsibility-center',
    requiresCluster: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'oc-6',
    name: 'Support',
    code: 'SUP',
    description: 'Support functions - provides internal support services',
    status: 'active',
    officeType: 'office',
    budgetingApproach: 'cost-center',
    requiresCluster: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'oc-7',
    name: 'Oversight',
    code: 'OVER',
    description: 'Oversight and monitoring - provides quality assurance',
    status: 'active',
    officeType: 'department',
    budgetingApproach: 'responsibility-center',
    requiresCluster: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
]

/**
 * Fetch all office categories
 */
export async function fetchOfficeCategories(): Promise<OfficeCategorySetting[]> {
  return OFFICE_CATEGORIES_DB
}

/**
 * Fetch office category by ID
 */
export async function fetchOfficeCategoryById(id: string): Promise<OfficeCategorySetting | null> {
  return OFFICE_CATEGORIES_DB.find((category) => category.id === id) || null
}

/**
 * Create new office category
 */
export async function createOfficeCategory(data: Omit<OfficeCategorySetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeCategorySetting> {
  const newCategory: OfficeCategorySetting = {
    ...data,
    id: `oc-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  OFFICE_CATEGORIES_DB.push(newCategory)
  return newCategory
}

/**
 * Update office category
 */
export async function updateOfficeCategory(id: string, data: Partial<OfficeCategorySetting>): Promise<OfficeCategorySetting | null> {
  const index = OFFICE_CATEGORIES_DB.findIndex((category) => category.id === id)
  if (index === -1) return null
  
  OFFICE_CATEGORIES_DB[index] = {
    ...OFFICE_CATEGORIES_DB[index],
    ...data,
    id: OFFICE_CATEGORIES_DB[index].id,
    createdAt: OFFICE_CATEGORIES_DB[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  return OFFICE_CATEGORIES_DB[index]
}

/**
 * Delete office category
 */
export async function deleteOfficeCategory(id: string): Promise<boolean> {
  const index = OFFICE_CATEGORIES_DB.findIndex((category) => category.id === id)
  if (index === -1) return false
  OFFICE_CATEGORIES_DB.splice(index, 1)
  return true
}
