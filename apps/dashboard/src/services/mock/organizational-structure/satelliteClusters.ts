import type { SatelliteClusterSetting } from '@/components/features/planning/organizational-structure/types'

/**
 * Satellite Clusters Database
 * Defines geographic/operational clusters for multi-site organizational structures
 * Each cluster has a complete address and can contain multiple sub-units
 */
export let SATELLITE_CLUSTERS_DB: SatelliteClusterSetting[] = [
  {
    id: 'sc-1',
    name: 'Metro Manila',
    code: 'MM',
    description: 'Metro Manila cluster - National Capital Region operations',
    status: 'active',
    region: 'NCR',
    province: 'Metro Manila',
    municipality: 'Quezon City',
    barangay: 'Bagumbayan',
    maxSubUnits: 5,
    coordinationMechanism: 'Monthly coordination meetings',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'sc-2',
    name: 'Visayas',
    code: 'VIS',
    description: 'Visayas cluster - Central Philippine operations',
    status: 'active',
    region: 'Region VII',
    province: 'Cebu',
    municipality: 'Cebu City',
    barangay: 'Punta Princesa',
    maxSubUnits: 3,
    coordinationMechanism: 'Quarterly coordination meetings',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'sc-3',
    name: 'Mindanao',
    code: 'MND',
    description: 'Mindanao cluster - Southern Philippine operations',
    status: 'active',
    region: 'Region XI',
    province: 'Davao City',
    municipality: 'Davao City',
    barangay: 'Poblacion',
    maxSubUnits: 4,
    coordinationMechanism: 'Bi-monthly coordination meetings',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'sc-4',
    name: 'Luzon North',
    code: 'LN',
    description: 'Luzon North cluster - Northern Philippine operations',
    status: 'active',
    region: 'Region I',
    province: 'Pangasinan',
    municipality: 'Dagupan City',
    barangay: 'Dagupan West',
    maxSubUnits: 3,
    coordinationMechanism: 'Monthly coordination meetings',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'sc-5',
    name: 'Luzon South',
    code: 'LS',
    description: 'Luzon South cluster - Southern Luzon operations',
    status: 'active',
    region: 'Region IV-A',
    province: 'Cavite',
    municipality: 'Trece Martires',
    barangay: 'Poblacion',
    maxSubUnits: 3,
    coordinationMechanism: 'Quarterly coordination meetings',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
]

/**
 * Fetch all satellite clusters
 */
export async function fetchSatelliteClusters(): Promise<SatelliteClusterSetting[]> {
  return SATELLITE_CLUSTERS_DB
}

/**
 * Fetch satellite cluster by ID
 */
export async function fetchSatelliteClusterById(id: string): Promise<SatelliteClusterSetting | null> {
  return SATELLITE_CLUSTERS_DB.find((cluster) => cluster.id === id) || null
}

/**
 * Create new satellite cluster
 */
export async function createSatelliteCluster(data: Omit<SatelliteClusterSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<SatelliteClusterSetting> {
  const newCluster: SatelliteClusterSetting = {
    ...data,
    id: `sc-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  SATELLITE_CLUSTERS_DB.push(newCluster)
  return newCluster
}

/**
 * Update satellite cluster
 */
export async function updateSatelliteCluster(id: string, data: Partial<SatelliteClusterSetting>): Promise<SatelliteClusterSetting | null> {
  const index = SATELLITE_CLUSTERS_DB.findIndex((cluster) => cluster.id === id)
  if (index === -1) return null
  
  SATELLITE_CLUSTERS_DB[index] = {
    ...SATELLITE_CLUSTERS_DB[index],
    ...data,
    id: SATELLITE_CLUSTERS_DB[index].id,
    createdAt: SATELLITE_CLUSTERS_DB[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  return SATELLITE_CLUSTERS_DB[index]
}

/**
 * Delete satellite cluster
 */
export async function deleteSatelliteCluster(id: string): Promise<boolean> {
  const index = SATELLITE_CLUSTERS_DB.findIndex((cluster) => cluster.id === id)
  if (index === -1) return false
  SATELLITE_CLUSTERS_DB.splice(index, 1)
  return true
}

/**
 * Get clusters by region
 */
export async function fetchClustersByRegion(region: string): Promise<SatelliteClusterSetting[]> {
  return SATELLITE_CLUSTERS_DB.filter((cluster) => cluster.region === region)
}

/**
 * Get active clusters
 */
export async function fetchActiveClusters(): Promise<SatelliteClusterSetting[]> {
  return SATELLITE_CLUSTERS_DB.filter((cluster) => cluster.status === 'active')
}
