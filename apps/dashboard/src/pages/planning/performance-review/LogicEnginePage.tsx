import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePerformanceReviewStore } from '@/features/planning/performance-review/store/performanceReviewStore'
import { usePerformanceCalculation } from '@/features/planning/performance-review/hooks/usePerformanceCalculation'
import { OPCRSelectionRequired } from '@/features/planning/performance-review/components/OPCRSelectionRequired'
import {
  KPI_CATEGORY_LABELS,
  KPI_CATEGORY_WEIGHTS,
} from '@/features/planning/performance-review/types'

export default function LogicEnginePage() {
  const { currentSession } = usePerformanceReviewStore()
  const calc = usePerformanceCalculation(currentSession)

  if (!currentSession) {
    return <OPCRSelectionRequired />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logic Engine</CardTitle>
        <CardDescription>
          Shows computed category averages and their weighted contribution to
          the final rating based on configured category weights.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {(['STRATEGIC', 'CORE', 'SUPPORT'] as const).map((category) => {
          const avg =
            calc.categoryAverages.final[category] ??
            calc.categoryAverages.self[category]
          const weight = KPI_CATEGORY_WEIGHTS[category]
          const weighted = avg !== null ? avg * weight : null

          return (
            <div
              key={category}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{KPI_CATEGORY_LABELS[category]}</p>
                <p className="text-xs text-muted-foreground">
                  Weight: {(weight * 100).toFixed(0)}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Avg: {avg?.toFixed(2) ?? '—'}</Badge>
                <Badge>Weighted: {weighted?.toFixed(2) ?? '—'}</Badge>
              </div>
            </div>
          )
        })}

        <div className="rounded-md border bg-primary/5 px-3 py-2 text-sm font-semibold flex items-center justify-between">
          <span>Final Rating Score</span>
          <span>
            {(
              calc.finalRatingScore.final ?? calc.finalRatingScore.self
            )?.toFixed(2) ?? '—'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
