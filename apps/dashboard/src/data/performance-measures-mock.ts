import type { PerformanceMeasure } from '@/components/features/planning/kpi'

// Standard Performance Measures list
export const performanceMeasures: Array<PerformanceMeasure> = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Efficiency',
    description:
      'Measure of how well resources are utilized to achieve outputs',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Timeliness',
    description: 'Measure of whether deliverables are completed on schedule',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Effectiveness',
    description: 'Measure of how well objectives are achieved',
  },
]

// Numerical Ratings Scale (1-5)
export const numericalRatingsScale = [
  { rating: 1 },
  { rating: 2 },
  { rating: 3 },
  { rating: 4 },
  { rating: 5 },
]

// Grouped by type for backwards compatibility
export const performanceMeasuresByType = {
  efficiency: [performanceMeasures[0]],
  timeliness: [performanceMeasures[1]],
  effectiveness: [performanceMeasures[2]],
}
