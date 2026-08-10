/**
 * Budget Distribution Module - Type Definitions
 */

export interface BaseKPITarget {
  kpiId: string
  kpiCode: string
  kpiName: string
  aggregationMethod: string
  baseTargetValue: number | null
  q1: number | null
  q2: number | null
  q3: number | null
  q4: number | null
  isSelected: boolean
  isLocked: boolean
}

export interface TargetRow {
  id: string
  kpiId: string
  kpiCode: string
  kpiName: string
  officeId: string
  officeName: string
  aggregationMethod: string
  targetValue: number | null
  q1: number | null
  q2: number | null
  q3: number | null
  q4: number | null
  status: 'draft' | 'proposed' | 'negotiating' | 'agreed'
  isLocked: boolean
  isShoppedByOffice?: boolean
}

export interface OfficeAssignment {
  kpiId: string
  kpiCode: string
  kpiName: string
  assignedOfficeIds: Set<string>
}

export interface Office {
  id: string
  name: string
}

export type AggregationType = 'SUM' | 'AVERAGE' | 'NON_CUMULATIVE'

export type TargetStatus = 'draft' | 'proposed' | 'negotiating' | 'agreed'
