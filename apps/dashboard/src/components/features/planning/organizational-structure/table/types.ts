export type OrgUnit = {
  id: string
  name: string
  code: string
  type?: 'Oversight' | 'Delivery' | 'Support'
  description?: string
  parentId?: string | null
  status?: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
  positionCount?: number
}

export type SalaryGradeRef = {
  id: string
  name: string
}

export type Position = {
  id: string
  title: string
  code?: string
  orgUnitId: string
  description?: string
  salaryGrade?: SalaryGradeRef
  itemNumber?: string
  authorizedFTE?: number
  status: 'active' | 'inactive' | 'filled' | 'vacant' | 'frozen'
  createdAt: string
  updatedAt: string
}

export type {
  PersonnelPositionApiResponse as PersonnelPosition,
  PersonnelPositionRecord,
  PersonnelPositionUser,
} from '@/services/api/personnelPositions'

export type Personnel = {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  email?: string
  position?: string
  orgUnitId?: string
  designation?: string
  employeeNumber?: string
  employmentStatus?: 'Permanent' | 'Contractual' | 'Casual' | 'Coterminous'
  startDate?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}
