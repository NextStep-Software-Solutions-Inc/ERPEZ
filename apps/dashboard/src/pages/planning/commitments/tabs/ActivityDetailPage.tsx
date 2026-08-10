import { ArrowLeft, Activity, FileText, DollarSign, Users, Calendar, Tag, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ActivityDetail {
  id?: number
  name?: string
  kpi: string
  description?: string
  category?: string
  dimension: string
  responsibleOffice?: string
  startDate?: string
  endDate?: string
  budget?: number
  isConfigured?: boolean
}

interface ActivityDetailPageProps {
  item: ActivityDetail | null
  quarterlyTargets?: Record<string, number>
  fiscalYear?: number
  onBack: () => void
}

const getDimensionClasses = (indicator: string) => {
  switch (indicator) {
    case 'Quality':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'Efficiency':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'Timeliness':
      return 'bg-purple-100 text-purple-800 border-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function ActivityDetailPage({ item, quarterlyTargets, fiscalYear, onBack }: ActivityDetailPageProps) {
  if (!item) return null

  const startDate = item.startDate ? new Date(item.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'N/A'

  const endDate = item.endDate ? new Date(item.endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'N/A'

  const quarterLabels = {
    Q1: 'Q1 (Jan-Mar)',
    Q2: 'Q2 (Apr-Jun)',
    Q3: 'Q3 (Jul-Sep)',
    Q4: 'Q4 (Oct-Dec)',
  } as const

  const hasQuarterlyTargets = quarterlyTargets && Object.keys(quarterlyTargets).length > 0

  // Show minimal view for unconfigured activities (only KPI/Dimension info)
  const isUnconfigured = !item.isConfigured

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{isUnconfigured ? item.kpi : item.name}</h1>
                <p className="text-sm text-slate-500 mt-1">{isUnconfigured ? `Dimension: ${item.dimension}` : `Activity ID: ${item.id}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getDimensionClasses(item.dimension)}>
                {item.dimension}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Activity Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Activity Name */}
                <div>
                  <label className="text-sm font-medium text-slate-600">Activity Name</label>
                  <p className="text-base font-semibold text-slate-900 mt-2">{isUnconfigured ? '-' : item.name}</p>
                </div>

                {/* KPI */}
                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Key Performance Indicator
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">{item.kpi}</p>
                </div>

                {/* Dimension */}
                <div>
                  <label className="text-sm font-medium text-slate-600">Dimension</label>
                  <div className="mt-2">
                    <Badge variant="outline" className={getDimensionClasses(item.dimension)}>
                      {item.dimension}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Involved Divisions Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Involved Divisions
              </h2>
              
              {item.responsibleOffice && !isUnconfigured ? (
                <div className="space-y-2">
                  {item.responsibleOffice.split(', ').map((division: string, index: number) => (
                    <div key={index} className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">{division}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No divisions assigned</p>
              )}
            </div>

            {/* Description Card */}
            {!isUnconfigured && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Description
                </h2>
                <p className="text-slate-700 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Timeline & Budget Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Timeline & Budget
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-600">Start Date</label>
                  <p className="text-base font-semibold text-slate-900 mt-2">{isUnconfigured ? '-' : startDate}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">End Date</label>
                  <p className="text-base font-semibold text-slate-900 mt-2">{isUnconfigured ? '-' : endDate}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget (₱)
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">
                    {isUnconfigured ? '-' : (item.budget ? item.budget.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) : 'Not Set')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quarterly Targets Card */}
            {hasQuarterlyTargets && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-600" />
                  Quarterly Targets {fiscalYear && `(FY ${fiscalYear})`}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quarterlyTargets && (
                    <>
                      {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((quarter) => (
                        <div
                          key={quarter}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50"
                        >
                          <div>
                            <label className="text-sm font-medium text-slate-600">
                              {quarterLabels[quarter]}
                            </label>
                            <p className="text-lg font-semibold text-slate-900 mt-2">
                              {quarterlyTargets[quarter] !== undefined
                                ? quarterlyTargets[quarter].toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : '-'}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="outline"
                              className={
                                quarterlyTargets[quarter] !== undefined
                                  ? 'bg-green-100 text-green-800 border-green-300'
                                  : 'bg-gray-100 text-gray-800 border-gray-300'
                              }
                            >
                              {quarterlyTargets[quarter] !== undefined ? 'Set' : 'Not Set'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {!hasQuarterlyTargets && (
              <div className="bg-white rounded-lg border border-amber-200 p-6 shadow-sm bg-amber-50">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  Quarterly Targets
                </h2>
                <p className="text-sm text-amber-700">
                  No quarterly targets have been set for this activity yet.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Metadata
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="font-medium text-slate-600">Activity ID</label>
                  <p className="text-slate-700 mt-1 font-mono">#{isUnconfigured ? '-' : item.id}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <label className="font-medium text-slate-600">Fiscal Year</label>
                  <p className="text-slate-700 mt-1">{isUnconfigured ? '-' : (item.startDate ? new Date(item.startDate).getFullYear() : 'N/A')}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <label className="font-medium text-slate-600">KPI</label>
                  <p className="text-slate-700 mt-1">{item.kpi}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
