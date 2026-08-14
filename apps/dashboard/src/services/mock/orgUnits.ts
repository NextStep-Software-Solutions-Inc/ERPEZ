export type OrgUnit = {
  id: string
  name: string
  code: string
  type: 'office' | 'division' | 'section' | 'unit' | 'department' | 'bureau' | 'service' | 'center'
  category?: 'executive' | 'administrative' | 'technical' | 'support' | 'oversight' | 'delivery' | 'regulatory'
  level?: 'central' | 'regional' | 'provincial' | 'municipal' | 'barangay' | 'satellite'
  cluster?: string
  procurementWorkflow?: string
  budgetingCostCenter?: string
  parentId: string | null
  address?: string
  responsibilityCenter?: string
  // New optional fields mapped from enhanced API responses
  organizationName?: string
  parentOfficeName?: string
  administrativeLevelName?: string
  categoryName?: string
  createdAt?: string
  createdBy?: string
  // Government Schema Fields
  uacsCode?: string
  agencyId?: string
  region?: string
  province?: string
  municipality?: string
  barangay?: string
  status: 'active' | 'inactive'
  // human-readable description (from API)
  description?: string
  // office establishment information (e.g. legal basis)
  establishedVia?: string
  // Soft delete support
  deleted_at?: string | null
  // Position count from backend
  positionCount?: number
}

// In-memory mock DB with realistic government structure
let DB: OrgUnit[] = []

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms))

export async function fetchOrgUnits(): Promise<OrgUnit[]> {
  await delay(300)
  // Return a shallow copy, excluding soft-deleted units
  return DB.filter((u) => !u.deleted_at).slice()
}

export async function createOrgUnit(payload: Omit<OrgUnit, 'id'>): Promise<OrgUnit> {
  await delay(200)
  const newUnit: OrgUnit = {
    ...payload,
    id: Math.random().toString(36).substr(2, 9),
    status: payload.status || 'active',
  }
  DB.push(newUnit)
  return { ...newUnit }
}

export async function fetchOrgUnitById(id: string): Promise<OrgUnit | null> {
  await delay(200)
  const found = DB.find((u) => u.id === id && !u.deleted_at) ?? null
  return found ? { ...found } : null
}

export async function updateOrgUnit(id: string, updates: Partial<OrgUnit>): Promise<OrgUnit | null> {
  await delay(200)
  DB = DB.map((u) => (u.id === id ? { ...u, ...updates } : u))
  const updated = DB.find((u) => u.id === id) ?? null
  return updated ? { ...updated } : null
}

export async function deleteOrgUnit(id: string): Promise<boolean> {
  await delay(200)
  const unit = DB.find((u) => u.id === id)
  if (!unit) return false
  
  // Check for active child units
  const hasActiveChildren = DB.some((u) => u.parentId === id && u.status === 'active' && !u.deleted_at)
  if (hasActiveChildren) {
    throw new Error('Cannot delete: Unit has active child units. Please delete or reassign child units first.')
  }
  
  // Soft delete: Mark with deleted_at timestamp instead of removing from DB
  DB = DB.map((u) => 
    u.id === id 
      ? { ...u, deleted_at: new Date().toISOString(), status: 'inactive' } 
      : u
  )
  return true
}

/**
 * Check if an organizational unit can be deleted
 * Returns validation result with error message if validation fails
 */
export async function validateOrgUnitDeletion(id: string): Promise<{
  canDelete: boolean
  reason?: string
}> {
  await delay(100)
  const unit = DB.find((u) => u.id === id)
  
  if (!unit) {
    return { canDelete: false, reason: 'Unit not found' }
  }
  
  // Check for active child units
  const activeChildren = DB.filter((u) => u.parentId === id && u.status === 'active' && !u.deleted_at)
  if (activeChildren.length > 0) {
    return { 
      canDelete: false, 
      reason: `Cannot delete: This unit has ${activeChildren.length} active child unit(s). Please reassign or delete them first.`
    }
  }
  
  // Note: Personnel check would be here in production
  // For now, assume personnel service is separate
  
  return { canDelete: true }
}

// Synchronous getters for direct access (needed for PMT generation and other sync contexts)
export function getOrgUnits(): OrgUnit[] {
  return DB.filter((u) => !u.deleted_at)
}
