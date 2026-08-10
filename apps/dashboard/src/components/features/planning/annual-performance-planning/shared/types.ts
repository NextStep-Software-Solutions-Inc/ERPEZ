/**
 * Shared types for Annual Performance Planning Module
 * 
 * Centralized type definitions used across fiscal-year, kpi-activation, and target-distribution features
 */

export type DialogMode = 'create' | 'edit' | 'view'

export interface DialogState {
  isOpen: boolean
  mode: DialogMode
  selectedId: string | null
}

export interface FormState {
  isDirty: boolean
  isSaving: boolean
  errors: Record<string, string>
}

export interface PaginationState {
  pageIndex: number
  pageSize: number
}

export interface SortingState {
  id: string
  desc: boolean
}

export interface TableState {
  columnVisibility: Record<string, boolean>
  sorting: SortingState[]
  columnFilters: Array<{ id: string; value: unknown }>
  globalFilter: string
  pagination: PaginationState
}
