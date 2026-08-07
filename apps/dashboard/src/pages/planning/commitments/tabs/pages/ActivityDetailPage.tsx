import { ArrowLeft, AlertCircle, CheckCircle, Calendar, FileText, DollarSign, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Activity {
  id?: string
  activityName: string
  name?: string
  description?: string
  kpi?: string
  dimension?: string
  subKpiId?: string
  startDate?: string
  endDate?: string
  status?: string
  budget?: number
  responsibleOffice?: string
  involvedDivisions?: string | string[]
  category?: string
  createdAt?: string
  updatedAt?: string
}

interface ActivityDetailPageProps {
  activity: Activity | null
  onBack: () => void
  isSubKpiActivity?: boolean
}

export function ActivityDetailPage({ activity, onBack, isSubKpiActivity = false }: ActivityDetailPageProps) {
  if (!activity) return null

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
                <h1 className="text-2xl font-bold text-slate-900">{activity.activityName}</h1>
                <p className="text-sm text-slate-500 mt-1">{isSubKpiActivity ? 'Sub-KPI Activity' : 'Activity'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activity.status === 'active' && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
              {activity.status === 'completed' && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Activity Information */}
          <div className="lg:col-span-2">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-8 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                Activity Information
              </h2>

              <div className="space-y-6">
                {/* Activity Name */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Activity Name</label>
                  <p className="text-base font-semibold text-slate-900">{activity.activityName}</p>
                </div>

                {/* Description */}
                {activity.description && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Description</label>
                    <div className="bg-blue-50 rounded border border-blue-200 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                      {activity.description}
                    </div>
                  </div>
                )}

                {/* Budget */}
                {activity.budget !== undefined && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Proposed Budget</label>
                    </div>
                    <p className="text-xl font-bold text-green-700">
                      ₱ {typeof activity.budget === 'number' ? activity.budget.toLocaleString() : activity.budget}
                    </p>
                  </div>
                )}

                {/* KPI and Dimension Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* KPI Reference */}
                  {activity.kpi && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Related KPI</label>
                      </div>
                      <p className="text-base font-semibold text-slate-900">{activity.kpi}</p>
                    </div>
                  )}

                  {/* Dimension Reference */}
                  {activity.dimension && (
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">Dimension</label>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">{activity.dimension}</Badge>
                    </div>
                  )}
                </div>

                {/* Sub-KPI Reference */}
                {activity.subKpiId && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">Sub-KPI ID</label>
                    <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300">
                      {activity.subKpiId}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Divisions Involved */}
          {activity.responsibleOffice && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">Divisions Involved</h2>
                </div>
                <div className="space-y-3">
                  {activity.responsibleOffice.split(',').map((division, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-3">
                      <p className="text-sm font-semibold text-purple-900">{division.trim()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
