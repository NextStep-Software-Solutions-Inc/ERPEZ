/**
 * Common types and enums for UACS code segments
 */

/**
 * Expense Class Enumeration
 * Based on Government Accounting Manual (GAM)
 */
export enum ExpenseClass {
  PS = 'PS',   // Personal Services
  MOOE = 'MOOE', // Maintenance & Other Operating Expenses
  CO = 'CO',   // Capital Outlay
  FE = 'FE',   // Financial Expenses
}

/**
 * Code Segment Type Enumeration
 */
export enum CodeSegmentType {
  FUNDING_SOURCE = 'FUNDING_SOURCE',
  ORGANIZATION = 'ORGANIZATION',
  LOCATION = 'LOCATION',
  MFO_PAP = 'MFO_PAP',
  OBJECT = 'OBJECT',
}

/**
 * MFO/PAP Type Enumeration
 * Represents the hierarchy level in Program-Activity-Project structure
 */
export enum MfoPapType {
  PROGRAM = 'PROGRAM',
  ACTIVITY = 'ACTIVITY',
  PROJECT = 'PROJECT',
}

/**
 * Base interface for all UACS code segments
 */
export interface UacsCodeSegmentBase {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
  fiscalYear: number
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}
