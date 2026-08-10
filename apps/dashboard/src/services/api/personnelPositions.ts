import api from '@/services/api'

export type PersonnelPositionUser = {
  id: string
  employeeNumber?: string
  username?: string
  email?: string
  firstName?: string
  middleName?: string
  lastName?: string
  nameExtension?: string
  fullName?: string
  phoneNumber?: string
  employmentStatus?: string
  dateHired?: string
  dateSeparated?: string | null
  isActive?: boolean
  officeId?: string
  officeName?: string
}

export type PersonnelPositionRecord = {
  id: string
  title?: string
  functionalTitle?: string
  code?: string
  jobDescription?: string
  qualifications?: string
  fte?: number
  operationalStatus?: string
  positionTypeId?: string
  plantillaTypeId?: string
  salaryGradeId?: string
  stepId?: string
  officeId?: string
  officeName?: string
}

export type PersonnelPositionApiResponse = {
  id: string
  userId: string
  positionId: string
  assignmentType: string
  isActive: boolean
  startDate?: string
  endDate?: string
  createdAt?: string
  createdBy?: string
  positionTitle?: string
  positionCode?: string
  user: PersonnelPositionUser
  position: PersonnelPositionRecord
}

export async function fetchPersonnelPositionsFromApi(): Promise<
  PersonnelPositionApiResponse[]
> {
  // axios interceptor will append bearer token automatically
  try {
    const response = await api.get<{
      succeeded: boolean
      message: string | null
      data: PersonnelPositionApiResponse[]
    }>('/personnel-positions')
    if (
      response.data &&
      response.data.succeeded &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data
    }
    return []
  } catch (error) {
    console.error('Failed to fetch personnel positions from API:', error)
    return []
  }
}

export interface CreatePersonnelPositionRequest {
  userId: string
  positionId: string
  assignmentType: string
  isActive: boolean
  startDate?: string
  endDate?: string | null
}

export async function createPersonnelPosition(
  payload: CreatePersonnelPositionRequest,
): Promise<PersonnelPositionApiResponse> {
  try {
    const response = await api.post<PersonnelPositionApiResponse>(
      '/personnel-positions',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Failed to create personnel position via API:', error)
    throw error
  }
}
