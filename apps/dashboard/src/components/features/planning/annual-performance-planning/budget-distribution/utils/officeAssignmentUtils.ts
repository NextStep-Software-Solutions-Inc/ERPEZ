/**
 * Office Assignment business logic handlers
 */

import type { OfficeAssignment } from '../mocks'

interface UseOfficeAssignmentHandlersProps {
  assignments: OfficeAssignment[]
  setAssignments: (assignments: OfficeAssignment[]) => void
}

export function useOfficeAssignmentHandlers({
  assignments,
  setAssignments,
}: UseOfficeAssignmentHandlersProps) {
  const updateAssignment = (
    assignmentId: string,
    updates: Partial<OfficeAssignment>
  ) => {
    setAssignments(
      assignments.map((a) =>
        a.id === assignmentId ? { ...a, ...updates } : a
      )
    )
  }

  const removeAssignment = (assignmentId: string) => {
    setAssignments(assignments.filter((a) => a.id !== assignmentId))
  }

  const addAssignment = (newAssignment: OfficeAssignment) => {
    setAssignments([...assignments, newAssignment])
  }

  const submitAssignments = () => {
    return assignments.map((a) => ({
      ...a,
      status: 'submitted' as const,
    }))
  }

  const calculateQuarterlyTotal = (q1: number | null, q2: number | null, q3: number | null, q4: number | null): number => {
    return (q1 || 0) + (q2 || 0) + (q3 || 0) + (q4 || 0)
  }

  const isAssignmentValid = (assignment: OfficeAssignment): boolean => {
    return (assignment.officeTarget !== null && assignment.officeTarget > 0) ||
      (assignment.isFromPlanning && assignment.allocationFromPlanning > 0)
  }

  return {
    updateAssignment,
    removeAssignment,
    addAssignment,
    submitAssignments,
    calculateQuarterlyTotal,
    isAssignmentValid,
  }
}
