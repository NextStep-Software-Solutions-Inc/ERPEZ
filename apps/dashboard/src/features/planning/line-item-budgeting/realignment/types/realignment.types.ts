/**
 * Type Definitions for Budget Realignment Feature
 * Unified, strictly typed definitions for Activity/OPCR and Project Level Realignment
 */

// ==========================================
// ACTIVITY-BASED TYPES
// ==========================================

export interface BudgetItem {
  id: string
  description: string
  q1: number
  q2: number
  q3: number
  q4: number
  total: number
  isDeleted?: boolean
}

export interface ItemOfExpenditure {
  id: string
  name: string
  items: BudgetItem[]
}

export interface ExpenditureType {
  id: string
  name: string
  type: 'PS' | 'MOOE' | 'CO'
  itemsOfExpenditure: ItemOfExpenditure[]
}

export interface Activity {
  id: string
  name: string
  wfpObjectiveActivityId?: string
  opcrActivityId?: string
  expenditureTypes: ExpenditureType[]
}

export interface LibVersion {
  version: number
  timestamp: string
  reason: string
  modifiedBy: string
  activities: Activity[]
  approved?: boolean
}

// ==========================================
// PROJECT-BASED TYPES
// ==========================================

export interface ProjectItem {
  id: string
  description: string
  qty: number
  unitCost: number
  budget: number
  timelineType: 'ONGOING' | 'PERIOD'
  startDate: string
  endDate: string
  isDeleted?: boolean
}

export interface DescriptionGroup {
  id: string
  description: string
  items: ProjectItem[]
}

export interface ObjectGroup {
  id: string
  name: string
  code: string
  descriptionGroups: DescriptionGroup[]
}

export interface ProjectLibVersion {
  version: number
  timestamp: string
  reason: string
  modifiedBy: string
  objectGroups: ObjectGroup[]
  approved?: boolean
}

// ==========================================
// SHARED / UTILITY TYPES
// ==========================================

export type ChangeIndicator = 'added' | 'deleted' | 'edited' | 'unchanged'

export interface CellChange {
  indicator: ChangeIndicator
  prevValue?: number
}
