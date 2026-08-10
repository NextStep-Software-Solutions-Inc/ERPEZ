import { Button } from '@/components/ui/button'
import { ArrowLeft, DollarSign, FileText, Users, Zap } from 'lucide-react'
import { OPCRActivity } from '@/features/planning/opcr/types'
import { KPIAssignment } from '@/features/planning/kpi-assignment/types'

interface OPCRActivityDetailsProps {
  activity: OPCRActivity
  kpiAssignment?: KPIAssignment
  onBack?: () => void
}

export function OPCRActivityDetails({
  activity,
  kpiAssignment,
  onBack,
}: OPCRActivityDetailsProps) {
  return (
    <div className="min-h-screen bg-white">
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
                <h1 className="text-2xl font-bold text-slate-900">
                  {activity?.name || 'Unnamed Activity'}
                </h1>
                <p className="text-sm text-slate-500 mt-1">Activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Activity Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Information Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Activity Information
              </h2>

              <div className="space-y-6">
                {/* Activity Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Activity Name
                  </label>
                  <p className="text-base text-slate-900 font-semibold">
                    {activity?.name || '-'}
                  </p>
                </div>

                {/* Description */}
                {activity?.description && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                )}

                {/* Budget */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <label className="text-sm font-medium text-slate-700">
                      Proposed Budget
                    </label>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    ₱ {activity?.budget?.toLocaleString() || '0'}
                  </p>
                </div>

                {/* Related KPI and Dimension */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Related KPI */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <label className="text-sm font-medium text-slate-700">
                        Related KPI
                      </label>
                    </div>
                    <p className="text-base font-semibold text-slate-900">
                      {kpiAssignment?.fyActiveKPI?.name || '-'}
                    </p>
                  </div>

                  {/* Dimension */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Dimension
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {kpiAssignment?.attributes &&
                      kpiAssignment.attributes.length > 0 ? (
                        kpiAssignment.attributes.map((attr) => (
                          <span
                            key={attr.id}
                            className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium"
                          >
                            {attr.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Divisions Involved */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Divisions Involved
              </h3>

              <div className="space-y-2">
                {activity?.PAPDepartments &&
                activity.PAPDepartments.length > 0 ? (
                  activity.PAPDepartments.map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {dept.office?.name || 'Unknown Department'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500 italic text-center py-4">
                    No departments assigned
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
