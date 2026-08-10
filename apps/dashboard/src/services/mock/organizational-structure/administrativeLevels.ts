import type { AdministrativeLevel, AdministrativeLevelFormValues } from '@/components/features/planning/organizational-structure/types'

/**
 * Administrative Levels Database
 * Defines the hierarchical levels in the organizational structure
 * Examples: Central, Regional, Provincial, Municipal, Barangay, Satellite
 */
export let ADMINISTRATIVE_LEVELS_DB: AdministrativeLevel[] = []

// READ Operations
export async function fetchAdministrativeLevels(): Promise<AdministrativeLevel[]> {
  return new Promise((resolve) => setTimeout(() => resolve([...ADMINISTRATIVE_LEVELS_DB]), 300))
}

export async function fetchAdministrativeLevelById(id: string): Promise<AdministrativeLevel | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ADMINISTRATIVE_LEVELS_DB.find((level) => level.id === id) || null)
    }, 100)
  })
}

// CREATE Operation
export async function createAdministrativeLevel(
  data: AdministrativeLevelFormValues
): Promise<AdministrativeLevel> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newLevel: AdministrativeLevel = {
        ...data,
        isActive: true, // Set default value
        id: `al-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user', // In real app, this would come from auth context
      }
      ADMINISTRATIVE_LEVELS_DB.push(newLevel)
      resolve(newLevel)
    }, 300)
  })
}

// UPDATE Operation
export async function updateAdministrativeLevel(
  id: string,
  data: Partial<AdministrativeLevelFormValues>
): Promise<AdministrativeLevel | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = ADMINISTRATIVE_LEVELS_DB.findIndex((level) => level.id === id)
      if (index !== -1) {
        const updated = {
          ...ADMINISTRATIVE_LEVELS_DB[index],
          ...data,
          id,
          createdAt: ADMINISTRATIVE_LEVELS_DB[index].createdAt,
          createdBy: ADMINISTRATIVE_LEVELS_DB[index].createdBy,
        }
        ADMINISTRATIVE_LEVELS_DB[index] = updated
        resolve(updated)
      } else {
        resolve(null)
      }
    }, 300)
  })
}
// DELETE Operation
export async function deleteAdministrativeLevel(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = ADMINISTRATIVE_LEVELS_DB.findIndex((level) => level.id === id)
      if (index !== -1) {
        ADMINISTRATIVE_LEVELS_DB.splice(index, 1)
        resolve(true)
      } else {
        resolve(false)
      }
    }, 300)
  })
}
