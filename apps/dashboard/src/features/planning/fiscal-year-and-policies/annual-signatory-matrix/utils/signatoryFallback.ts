import type { SignatoryAssignment } from '@/lib/fiscal-year-and-policies/types'
import type {
  WorkflowMatrix,
  WorkflowMatrixApprover,
} from '../types/workflowMatrixTypes'

/**
 * Get the approver for an office and role
 *
 * @param officeId - Office ID
 * @param role - 'recommending' or 'final'
 * @param signatories - Array of all signatory assignments
 * @returns SignatoryAssignment or null
 */
export function getApproverForOffice(
  officeId: string,
  role: 'recommending' | 'final',
  signatories: SignatoryAssignment[],
): SignatoryAssignment | null {
  // Try to find office-specific assignment.
  // This still reads the legacy assignment shape and is only used as a fallback.
  return (
    signatories.find((s) => s.departmentId === officeId && s.role === role) ||
    null
  )
}

function createEmptyApprover(): WorkflowMatrixApprover {
  return {
    position: {
      id: '',
      title: '',
      code: '',
    },
    currentUser: {
      id: '',
      name: '',
      email: '',
    },
  }
}

/**
 * Build a matrix row for display
 */
export function buildWorkflowMatrixRow(
  officeId: string,
  officeName: string,
  fiscalYearId: string,
  fiscalYear: number,
  signatories: SignatoryAssignment[],
): WorkflowMatrix {
  const recommendingSignatory = getApproverForOffice(
    officeId,
    'recommending',
    signatories,
  )

  const finalSignatory = getApproverForOffice(officeId, 'final', signatories)

  return {
    id: officeId,
    fiscalYearId,
    fiscalYear,
    officeId,
    officeName,
    documentType: undefined,
    status: 'draft',
    recommendingApprover: recommendingSignatory
      ? {
          ...createEmptyApprover(),
          currentUser: {
            id: recommendingSignatory.signatoryUserId,
            name: recommendingSignatory.signatoryUserName || '',
            email: '',
          },
        }
      : createEmptyApprover(),
    finalApprover: finalSignatory
      ? {
          ...createEmptyApprover(),
          currentUser: {
            id: finalSignatory.signatoryUserId,
            name: finalSignatory.signatoryUserName || '',
            email: '',
          },
        }
      : createEmptyApprover(),
    createdAt:
      recommendingSignatory?.createdAt ||
      finalSignatory?.createdAt ||
      new Date().toISOString(),
    createdBy: '',
    updatedAt:
      recommendingSignatory?.updatedAt ||
      finalSignatory?.updatedAt ||
      new Date().toISOString(),
    updatedBy: '',
  }
}
