import { OPCRPAPDepartment } from './type.opcr'

export type OPCRActivity = {
  id: string
  opcrId: string
  dukpiTargetAssignmentId: string
  name: string | null
  description: string | null
  budget: number
  PAPDepartments: OPCRPAPDepartment[] | null
}
