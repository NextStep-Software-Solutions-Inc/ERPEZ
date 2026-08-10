import { Button } from '@/components/ui/button'
import { ChevronRight, Award, Zap, Clock, ChevronLeft } from 'lucide-react'
import { KPITarget } from './types'

interface QETListPageProps {
  fiscalYear: number
  allKPIs: KPITarget[]
  onSelectIndicator: (indicator: 'Quality' | 'Efficiency' | 'Timeliness') => void
  onBack: () => void
}

export function QETListPage({ fiscalYear, allKPIs, onSelectIndicator, onBack }: QETListPageProps) {
  // Filter KPIs by fiscal year
  const kpisForYear = allKPIs.filter(kpi => kpi.fiscalYear === fiscalYear)

  // Count KPIs per indicator
  const getIndicatorKPICount = (indicator: 'Quality' | 'Efficiency' | 'Timeliness') => {
    return new Set(
      kpisForYear
        .filter(kpi => kpi.dimension === indicator)
        .map(kpi => kpi.kpiName)
    ).size
  }

  const dimensions = [
    {
      id: 'Quality',
      title: 'Quality',
      description: 'Product and service quality metrics',
      icon: Award,
      leftBorderColor: 'border-l-green-500',
      iconColor: 'text-green-600',
    },
    {
      id: 'Efficiency',
      title: 'Efficiency',
      description: 'Operational efficiency and productivity metrics',
      icon: Zap,
      leftBorderColor: 'border-l-orange-500',
      iconColor: 'text-orange-600',
    },
    {
      id: 'Timeliness',
      title: 'Timeliness',
      description: 'Time-based and deadline performance metrics',
      icon: Clock,
      leftBorderColor: 'border-l-purple-500',
      iconColor: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header with Back Button */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 gap-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Strategic Targets - Fiscal Year {fiscalYear}</h2>
        <p className="text-gray-600 mt-2">Select a Dimension to view KPIs</p>
      </div>

      {/* Dimension List */}
      <div className="space-y-5">
        {dimensions.map((indicator) => {
          const kpiCount = getIndicatorKPICount(indicator.id as any)
          const IconComponent = indicator.icon

          return (
            <button
              key={indicator.id}
              onClick={() => onSelectIndicator(indicator.id as any)}
              className={`${indicator.leftBorderColor} border-l-4 w-full bg-gray-50 border border-gray-200 rounded-lg py-10 px-5 text-left transition-all duration-200 hover:shadow-md hover:bg-gray-100`}
            >
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0">
                  <IconComponent className={`${indicator.iconColor} h-6 w-6`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">{indicator.title}</h3>
                  <p className="text-base text-gray-500 mt-1">{indicator.description}</p>
                </div>

                <div className="flex-shrink-0 ml-5">
                  <span className="text-base font-medium text-gray-700 px-4 py-1.5 bg-gray-200 rounded-full whitespace-nowrap">
                    {kpiCount} KPI{kpiCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Empty State */}
      {kpisForYear.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No strategic targets found for Fiscal Year {fiscalYear}.</p>
        </div>
      )}
    </div>
  )
}
