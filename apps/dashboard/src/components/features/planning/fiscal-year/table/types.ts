export type FunctionAllocation = {
  functionType: 'CoreFunction' | 'StrategicPriority' | 'MandatorySupport'
  percentage: number
}
export type FiscalYear = {
  id: string
  year: number
  description?: string
  isLocked: boolean
  functionAllocations: Array<FunctionAllocation>
}
