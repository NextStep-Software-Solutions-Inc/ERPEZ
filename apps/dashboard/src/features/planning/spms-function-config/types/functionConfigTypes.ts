export interface FunctionConfig {
  id: string
  fiscalYearId: string
  fiscalYearYear: number
  strategicMinWeight: number
  strategicMaxWeight?: number | null
  coreFunctionMinWeight: number
  coreFunctionMaxWeight?: number | null
  supportMinWeight: number
  supportMaxWeight?: number | null
  createdAt: string
  createdBy: string | null
  updatedAt: string | null
  updatedBy: string | null
}

export interface CreateFunctionConfigPayload {
  fiscalYearId: string
  strategicMinWeight: number
  strategicMaxWeight: number | null
  coreFunctionMinWeight: number
  coreFunctionMaxWeight: number | null
  supportMinWeight: number
  supportMaxWeight: number | null
}

export interface UpdateFunctionConfigPayload {
  strategicMinWeight: number
  strategicMaxWeight: number | null
  coreFunctionMinWeight: number
  coreFunctionMaxWeight: number | null
  supportMinWeight: number
  supportMaxWeight: number | null
}
