import api from '@/services/api'

/**
 * Positions API Response
 */
// Sub‑objects returned by the API (full payloads may contain many more fields,
// but we only include the ones we currently display or need).
export interface SalaryGradeApi {
  id: string
  name: string
  code: string
  gradeNumber: number
  stepIncrementAmount: number
  numberOfSteps: number
  effectiveDate: string
  description?: string
  isActive: boolean
  createdAt: string
}

export interface StepApi {
  id: string
  name: string
  code: string
  stepNumber: number
  minStep: number
  maxStep: number
  description?: string
  isActive: boolean
  createdAt: string
}

export interface PositionApiResponse {
  id: string
  title: string
  functionalTitle?: string
  code: string
  jobDescription?: string
  qualifications?: string
  fte: number
  operationalStatus: string
  positionTypeId?: string
  plantillaTypeId?: string
  salaryGradeId?: string
  salaryGrade?: SalaryGradeApi
  stepId?: string
  step?: StepApi
  officeId: string
  createdAt?: string
}

export interface PositionsApiPayload {
  succeeded: boolean
  message: string | null
  data: PositionApiResponse[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export interface SalaryGradeRef {
  id: string
  name: string
  code?: string
}

export interface StepRef {
  id: string
  name: string
  code?: string
}

export interface Position {
  id: string
  code: string
  title: string
  functionalTitle?: string
  jobDescription?: string
  qualifications?: string
  salaryGrade?: SalaryGradeRef | string
  authorizedFTE: number
  orgUnitId: string
  positionTypeId?: string
  plantillaTypeId?: string
  plantillaNumber?: string
  status: 'vacant' | 'filled' | 'frozen'
  itemNumber?: string
  stepIncrement: number
  step?: StepRef | string
  isPlantilla: boolean
  effectiveDate?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Maps API position response to Position format
 */
function mapPositionApiToPosition(apiPosition: PositionApiResponse): Position {
  // Normalize operational status to Position status
  const statusMap: Record<string, 'vacant' | 'filled' | 'frozen'> = {
    'Vacant': 'vacant',
    'Filled': 'filled',
    'Frozen': 'frozen',
    'vacant': 'vacant',
    'filled': 'filled',
    'frozen': 'frozen',
  }

  const status = statusMap[apiPosition.operationalStatus] || 'vacant'

  // derive salary grade reference if full object is available
  const salaryGrade: SalaryGradeRef | string | undefined =
    apiPosition.salaryGrade
      ? { id: apiPosition.salaryGrade.id, name: apiPosition.salaryGrade.name, code: apiPosition.salaryGrade.code }
      : apiPosition.salaryGradeId
        ? apiPosition.salaryGradeId
        : undefined

  const step: StepRef | string | undefined =
    apiPosition.step
      ? { id: apiPosition.step.id, name: apiPosition.step.name, code: apiPosition.step.code }
      : apiPosition.stepId

  return {
    id: apiPosition.id,
    code: apiPosition.code,
    title: apiPosition.title,
    functionalTitle: apiPosition.functionalTitle,
    jobDescription: apiPosition.jobDescription,
    qualifications: apiPosition.qualifications,
    salaryGrade,
    authorizedFTE: apiPosition.fte || 1,
    orgUnitId: apiPosition.officeId,
    positionTypeId: apiPosition.positionTypeId,
    plantillaTypeId: apiPosition.plantillaTypeId,
    plantillaNumber: apiPosition.plantillaTypeId ? `PL-${apiPosition.id.substring(0, 8)}` : undefined,
    status,
    itemNumber: undefined,
    stepIncrement: 1,
    step,
    isPlantilla: !!apiPosition.plantillaTypeId,
    createdAt: apiPosition.createdAt,
    updatedAt: apiPosition.createdAt,
  }
}

/**
 * Fetch all positions from the API
 * Endpoint: GET /positions
 */
export async function fetchPositionsFromApi(): Promise<Position[]> {
  try {
    const response = await api.get<PositionsApiPayload>('/positions')

    if (response.data && response.data.succeeded && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map(mapPositionApiToPosition)
    }

    return []
  } catch (error) {
    console.error('Failed to fetch positions from API:', error)
    throw error
  }
}

/**
 * Fetch positions by org unit ID from the API
 * Uses filter parameter: /positions?Filters=officeId%3D%3D{officeId}
 */
export async function fetchPositionsByOrgUnitFromApi(orgUnitId: string): Promise<Position[]> {
  try {
    const filter = `officeId%3D%3D${orgUnitId}`
    const response = await api.get<PositionsApiPayload>(
      `/positions?Filters=${filter}`
    )

    if (response.data && response.data.succeeded && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map(mapPositionApiToPosition)
    }

    return []
  } catch (error) {
    console.error(`Failed to fetch positions for org unit ${orgUnitId} from API:`, error)
    throw error
  }
}

/**
 * Fetch vacant positions (operationalStatus==Vacant)
 */
export async function fetchVacantPositionsFromApi(): Promise<Position[]> {
  try {
    const response = await api.get<PositionsApiPayload>('/positions?Filters=operationalStatus%3D%3DVacant')

    if (response.data && response.data.succeeded && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map(mapPositionApiToPosition)
    }

    return []
  } catch (error) {
    console.error('Failed to fetch vacant positions from API:', error)
    throw error
  }
}

/**
 * Fetch single position by ID
 */
export async function fetchPositionByIdFromApi(id: string): Promise<Position | null> {
  try {
    const response = await api.get<PositionApiResponse>(`/positions/${id}`)

    if (response.data) {
      return mapPositionApiToPosition(response.data)
    }

    return null
  } catch (error) {
    console.error(`Failed to fetch position ${id} from API:`, error)
    throw error
  }
}

/**
 * Create a new position
 */
export async function createPositionInApi(positionData: Partial<PositionApiResponse>): Promise<Position> {
  try {
    const response = await api.post<PositionApiResponse>(
      '/positions',
      payload
    )

    if (response.data) {
      return mapPositionApiToPosition(response.data)
    }

    throw new Error('Failed to create position')
  } catch (error) {
    console.error('Failed to create position via API:', error)
    throw error
  }
}

/**
 * Update an existing position
 */
export async function updatePositionInApi(
  id: string,
  positionData: Partial<PositionApiResponse>
): Promise<Position> {
  try {
    const response = await api.put<PositionApiResponse>(
      `/positions/${id}`,
      payload
    )

    if (response.data) {
      return mapPositionApiToPosition(response.data)
    }

    throw new Error('Failed to update position')
  } catch (error) {
    console.error(`Failed to update position ${id} via API:`, error)
    throw error
  }
}

/**
 * Delete a position
 */
export async function deletePositionFromApi(id: string): Promise<boolean> {
  try {
    await api.delete(`/positions/${id}`)
    return true
  } catch (error) {
    console.error(`Failed to delete position ${id} via API:`, error)
    throw error
  }
}

