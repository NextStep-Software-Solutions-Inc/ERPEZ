import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { assignKpiToOfficeRequest } from '../handlers/assignKpiToOfficeRequest'
import { getKpiAssignmentsRequest } from '@/features/planning/kpi-assignment/handlers/getKpiAssignmentsRequest'
import type { KPIAssignment } from '@/features/planning/kpi-assignment/types'

/**
 * Mutation hook for assigning a KPI to an office
 * Usage: const { mutateAsync, isPending } = useAssignKpiToOffice()
 */
export const useAssignKpiToOffice = createMutationHookFromTemplate(
  assignKpiToOfficeRequest,
)

/**
 * Hook to fetch KPI assignments with optional filters
 * Used for duplicate detection and existing assignments list
 */
export const useKpiAssignments = createQueryHookFromTemplate(
  getKpiAssignmentsRequest,
)

/**
 * Check if a KPI is already assigned to an office
 * Returns true if assignment exists
 */
export const checkKpiAssignmentExists = (
  assignments: KPIAssignment[],
  fyActiveKPIId: string,
  officeId: string,
): boolean => {
  return assignments.some(
    (assignment) =>
      assignment.fyActiveKPIId === fyActiveKPIId &&
      assignment.officeId === officeId,
  )
}
