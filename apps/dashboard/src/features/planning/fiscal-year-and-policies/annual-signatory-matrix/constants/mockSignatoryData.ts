/**
 * Mock data for Annual Signatory Matrix feature
 * Includes departments, users, and fiscal years for development/testing
 */

import type { User, Department } from '@/lib/fiscal-year-and-policies/types'
/**
 * Mock Departments
 * Used for department selection in the signatory matrix form
 */
export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'dept-001', name: 'Fiscal Operations Division', code: 'FOD' },
  { id: 'dept-002', name: 'Budget Planning Division', code: 'BPD' },
  { id: 'dept-003', name: 'Financial Audit Division', code: 'FAD' },
  { id: 'dept-004', name: 'Procurement Division', code: 'PCD' },
  { id: 'dept-005', name: 'Administrative Services Division', code: 'ASD' },
]

/**
 * Mock Users (Potential Approvers and Recommenders)
 * Used for dropdown selections in the signatory matrix form
 */
export const MOCK_USERS: User[] = [
  // Fiscal Operations Division
  {
    id: 'user-101',
    name: 'Juan Dela Cruz',
    department: 'Fiscal Operations Division',
    position: 'Division Chief',
  },
  {
    id: 'user-102',
    name: 'Maria Santos',
    department: 'Fiscal Operations Division',
    position: 'Senior Finance Officer',
  },

  // Budget Planning Division
  {
    id: 'user-103',
    name: 'Pedro Reyes',
    department: 'Budget Planning Division',
    position: 'Budget Officer',
  },
  {
    id: 'user-104',
    name: 'Lisa Wong',
    department: 'Budget Planning Division',
    position: 'Budget Analyst',
  },

  // Financial Audit Division
  {
    id: 'user-105',
    name: 'Carlos Rivera',
    department: 'Financial Audit Division',
    position: 'Audit Manager',
  },
  {
    id: 'user-106',
    name: 'Ana Garcia',
    department: 'Financial Audit Division',
    position: 'Auditor II',
  },

  // Procurement Division
  {
    id: 'user-107',
    name: 'Michael Tan',
    department: 'Procurement Division',
    position: 'Procurement Officer',
  },
  {
    id: 'user-108',
    name: 'Sarah Johnson',
    department: 'Procurement Division',
    position: 'Procurement Specialist',
  },

  // Administrative Services Division
  {
    id: 'user-109',
    name: 'Robert Martinez',
    department: 'Administrative Services Division',
    position: 'Administrative Officer',
  },
  {
    id: 'user-110',
    name: 'Elizabeth Lee',
    department: 'Administrative Services Division',
    position: 'Administrative Assistant III',
  },
]

/**
 * Mock Fiscal Years
 * Used for fiscal year selection in the signatory matrix form
 */

/**
 * Mock user ID to name mapping for quick lookups
 * Used throughout the signatory matrix for resolving user names from IDs
 */
export const MOCK_USER_ID_TO_NAME: Record<string, string> = {
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

/**
 * Mock department ID to name mapping for quick lookups
 */
export const MOCK_DEPARTMENT_ID_TO_NAME: Record<string, string> = {
  'dept-001': 'Fiscal Operations Division',
  'dept-002': 'Budget Planning Division',
  'dept-003': 'Financial Audit Division',
  'dept-004': 'Procurement Division',
  'dept-005': 'Administrative Services Division',
}

/**
 * Helper function to get user by ID
 */
export const getMockUserById = (userId: string): User | undefined => {
  return MOCK_USERS.find((user) => user.id === userId)
}

/**
 * Helper function to get department by ID
 */
export const getMockDepartmentById = (
  deptId: string,
): Department | undefined => {
  return MOCK_DEPARTMENTS.find((dept) => dept.id === deptId)
}

/**
 * Helper function to get fiscal year by ID
 */
