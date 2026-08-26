import api from '@/services/api'
import type { OrgUnit } from '@/services/mock/orgUnits'

/**
 * API Response types for office data
 */
export interface OfficeApiResponse {
  id: string
  name: string
  code: string
  address?: string
  description?: string
  responsibilityCenterCode?: string
  budgetCostCenter?: string
  officeTypeId?: string
  organizationId?: string
  categoryId?: string
  administrativeLevelId?: string
  clusterId?: string
  procurementWorkflowId?: string
  parentId?: string | null
  positionCount?: number
  createdAt?: string
  createdBy?: string
  // legacy flattened names (some endpoints still return these)
  officeTypeName?: string
  organizationName?: string
  categoryName?: string
  administrativeLevelName?: string
  procurementWorkflowName?: string | null
  parentOfficeName?: string | null

  // new nested objects returned by the enhanced API
  officeType?: { id?: string; name?: string }
  organization?: { id?: string; name?: string }
  category?: { id?: string; name?: string }
  administrativeLevel?: { id?: string; name?: string }
  procurementWorkflow?: { id?: string; name?: string }
  parentOffice?: { id?: string; name?: string }
  cluster?: {
    id?: string
    name?: string
    address?: string
    municipality?: string
    province?: string
    region?: string
  } | string | null
}

export interface OfficesApiPayload {
  succeeded: boolean
  message: string | null
  data: OfficeApiResponse[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

/**
 * Maps API office response to OrgUnit format
 */
function mapOfficeToOrgUnit(office: OfficeApiResponse): OrgUnit {
  // Prefer nested objects when available, fall back to flattened names for backward compatibility
  const officeTypeName = office.officeType?.name || office.officeTypeName || undefined
  const categoryName = office.category?.name || office.categoryName || undefined
  const adminLevelName = office.administrativeLevel?.name || office.administrativeLevelName || undefined
  const orgName = office.organization?.name || office.organizationName || undefined
  const parentName = office.parentOffice?.name || office.parentOfficeName || undefined

  // Cluster may be returned as an object or a string in different API versions
  const clusterName = typeof office.cluster === 'string' ? office.cluster : office.cluster?.name
  const clusterAddress = typeof office.cluster === 'object' && office.cluster?.address ? office.cluster.address : undefined
  const municipality = typeof office.cluster === 'object' && office.cluster?.municipality ? office.cluster.municipality : undefined
  const province = typeof office.cluster === 'object' && office.cluster?.province ? office.cluster.province : undefined
  const region = typeof office.cluster === 'object' && office.cluster?.region ? office.cluster.region : undefined

  return {
    id: office.id,
    name: office.name || '',
    code: office.code || '',
    type: (officeTypeName?.toLowerCase() || 'office') as OrgUnit['type'],
    category: (categoryName?.toLowerCase() || 'administrative') as OrgUnit['category'],
    cluster: clusterName || undefined,
    procurementWorkflow: office.procurementWorkflow?.name || office.procurementWorkflowName || undefined,
    budgetingCostCenter: office.budgetCostCenter || undefined,
    parentId: office.parentId || null,
    address: office.address || clusterAddress || undefined,
    responsibilityCenter: office.responsibilityCenterCode || undefined,
    uacsCode: office.responsibilityCenterCode || undefined,
    // map administrative level to the `level` enum when possible
    level: adminLevelName ? (adminLevelName.toLowerCase() as OrgUnit['level']) : undefined,
    // expose additional metadata for richer UI displays
    organizationName: orgName || undefined,
    parentOfficeName: parentName || undefined,
    administrativeLevelName: adminLevelName || undefined,
    categoryName: categoryName || undefined,
    createdAt: office.createdAt || undefined,
    createdBy: office.createdBy || undefined,
    region: region || undefined,
    province: province || undefined,
    municipality: municipality || undefined,
    // preserve description from API if provided
    description: office.description || undefined,
    // optional establishment text returned by API (legal basis)
    establishedVia: (office as any).establishedVia || undefined,
    // include position count from backend
    positionCount: office.positionCount || 0,
    status: 'active' as const,
  }
}

/**
 * Fetch all offices from the API
 */
// auth token is automatically added by axios interceptor (see config/axios.config.ts)
export async function fetchOfficesFromApi(): Promise<OrgUnit[]> {
  try {
    const response = await api.get<OfficesApiPayload>('/offices')

    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map(mapOfficeToOrgUnit)
    }

    return []
  } catch (error) {
    console.error('Failed to fetch offices from API:', error)
    throw error
  }
}

/**
 * Fetch single office by ID
 */
export async function fetchOfficeByIdFromApi(id: string): Promise<OrgUnit | null> {
  try {
    // API returns a wrapper with { succeeded, message, data: OfficeApiResponse }
    const response = await api.get<{
      succeeded: boolean
      message: string | null
      data: OfficeApiResponse
    }>(
      `/offices/${id}`
    )

    const payload = response.data && 'data' in response.data ? response.data.data : null
    if (payload) {
      return mapOfficeToOrgUnit(payload)
    }

    return null
  } catch (error) {
    console.error(`Failed to fetch office ${id} from API:`, error)
    throw error
  }
}

/**
 * Create a new office
 */
export async function createOfficeInApi(officeData: Partial<OfficeApiResponse>): Promise<OrgUnit> {
  try {
    const response = await api.post<{
      succeeded: boolean
      message: string | null
      data: OfficeApiResponse
    }>(
      '/offices',
      officeData
    )

    const payload = response.data && 'data' in response.data ? response.data.data : null
    if (payload) {
      return mapOfficeToOrgUnit(payload)
    }

    throw new Error('Failed to create office')
  } catch (error) {
    console.error('Failed to create office via API:', error)
    throw error
  }
}

/**
 * Update an existing office
 */
export async function updateOfficeInApi(
  id: string,
  officeData: Partial<OfficeApiResponse>
): Promise<OrgUnit> {
  try {
    const response = await api.put<{
      succeeded: boolean
      message: string | null
      data: OfficeApiResponse
    }>(
      `/offices/${id}`,
      officeData
    )

    const payload = response.data && 'data' in response.data ? response.data.data : null
    if (payload) {
      return mapOfficeToOrgUnit(payload)
    }

    throw new Error('Failed to update office')
  } catch (error) {
    console.error(`Failed to update office ${id} via API:`, error)
    throw error
  }
}

/**
 * Delete an office
 */
export async function deleteOfficeFromApi(id: string): Promise<boolean> {
  try {
    await api.delete(`/offices/${id}`)
    return true
  } catch (error) {
    console.error(`Failed to delete office ${id} via API:`, error)
    throw error
  }
}

