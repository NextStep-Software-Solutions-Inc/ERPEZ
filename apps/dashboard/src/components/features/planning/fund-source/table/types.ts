import { FiscalYear } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/types/types'

export type FundSource = {
  id: string
  parentId?: string
  name: string
  code: string
  category: string
  type: string
  isActive: boolean
  fiscalYearId?: string
  fiscalYear: FiscalYear
  totalReceivedFunds: number
  totalDUAllocatedFunds: number
  fundCluster: string
  authorization: string
  createdAt?: string
}

export type FundSourceDetails = FundSource & {
  description?: string
  totalReceivedFunds?: number
}

export type FundReceiving = {
  id: string
  fundSourceId: string
  amount: number
  fundSourceName?: string
  fundSourceCode?: string
  fundSourceIsActive?: boolean
}

export type FundReceivingDetails = FundReceiving & {
  description?: string
}
