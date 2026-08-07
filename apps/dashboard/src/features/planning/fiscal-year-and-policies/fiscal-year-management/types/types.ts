// Core domain types
export type FiscalYearStatus = 'setup' | 'planning' | 'active' | 'closed'

export type FiscalYear = {
  id: string
  year: number
  status: FiscalYearStatus
  description?: string
  isLocked?: boolean
}
