import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { KpiWithIndicators } from '../types'

interface KpiCardProps {
  kpi: KpiWithIndicators
  onClick?: () => void
  isClickable?: boolean
}

export function KpiCard({ kpi, onClick, isClickable = false }: KpiCardProps) {
  const indicatorCount = kpi.indicators?.length || 0
  const firstIndicators = kpi.indicators?.slice(0, 2) || []

  return (
    <Card
      className={`transition-all ${isClickable ? 'hover:shadow-lg cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Badge variant="outline" className="mb-2">
              {kpi.code}
            </Badge>
            <CardTitle className="text-lg">{kpi.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {kpi.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className="whitespace-nowrap">
            {indicatorCount} indicator{indicatorCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      {indicatorCount > 0 && (
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Success Indicators:
            </p>
            <div className="space-y-1">
              {firstIndicators.map((indicator) => (
                <div key={indicator.id} className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {indicator.code}
                  </span>
                  <span className="text-sm text-gray-600 truncate">
                    {indicator.name}
                  </span>
                </div>
              ))}
              {indicatorCount > 2 && (
                <p className="text-xs text-gray-500 mt-2">
                  +{indicatorCount - 2} more indicator
                  {indicatorCount - 2 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      )}

      {indicatorCount === 0 && (
        <CardContent>
          <p className="text-sm text-gray-500 italic">
            No indicators defined yet
          </p>
        </CardContent>
      )}
    </Card>
  )
}
