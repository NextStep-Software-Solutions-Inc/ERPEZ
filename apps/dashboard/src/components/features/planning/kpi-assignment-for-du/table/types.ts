import type { KPI } from "../../kpi/types"

export type SubKPI = {
  id: string
  name: string
  description: string
  functionType: string
  SDGs: Array<string>
  allocatedTargetValue: number
}

export type Target = {
  id: string
  period: string
  quarterName: string
  targetValue: number
}

export type KpiAssignment = {
  id: string
  kpiId: string
  deliveryUnitId: string
  targetId: string
  allocatedTargetValue: number
  description?: string
  KPI: KPI
  targets?: Array<Target>
  dateAssigned?: string
  subKPIs?: Array<SubKPI>
}

export type KpiTargetAssignments = {
  id: string
  KPI: KPI
  allocatedTargetValue: number
  dateAssignmed?: string
  subKPIs: Array<KPI>
  targets?: Array<Target>
}