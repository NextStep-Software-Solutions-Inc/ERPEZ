export type PerformanceMeasure = {
  id: string
  name: string
  description?: string
}

export type PerformanceMeasureDetail = PerformanceMeasure & {
  description: string
}
