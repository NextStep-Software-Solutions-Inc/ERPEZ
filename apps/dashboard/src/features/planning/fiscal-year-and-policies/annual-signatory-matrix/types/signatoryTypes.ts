/**
 * Type definitions for signatory matrix CRUD operations
 */

export type CreateSignatoryPayload = {
  fiscalYearId: string
  departmentId: string
  recommendingApproverId: string
  finalApproverId: string
}

export type UpdateSignatoryPayload = {
  recommendingApproverId: string
  finalApproverId: string
}

/**
 * Mock user data for resolving user names
 */
export const MOCK_USER_NAMES: Record<string, string> = {
  'user-101': 'Juan Dela Cruz',
  'user-102': 'Maria Santos',
  'user-103': 'Pedro Reyes',
  'user-104': 'Lisa Wong',
  'user-105': 'Carlos Rivera',
  'user-106': 'Ana Garcia',
  'user-107': 'Michael Tan',
  'user-108': 'Sarah Johnson',
  'user-109': 'Robert Martinez',
  'user-110': 'Elizabeth Lee',
}
