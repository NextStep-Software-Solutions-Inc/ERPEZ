import type { KpiRating, OpcrRating } from '../kpi'

export type PerformanceMeasure = {
  id: string
  name: string
  description?: string
  kpiRatings: Array<KpiRating>
  OpcrRatings: Array<OpcrRating>
}

export type PerformanceMeasureDetail = PerformanceMeasure & {
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
}
