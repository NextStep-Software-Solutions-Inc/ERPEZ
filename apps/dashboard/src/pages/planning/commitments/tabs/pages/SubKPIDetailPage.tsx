import { ArrowLeft, Target, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { SubKPI } from '../types'

interface SubKPIDetailPageProps {
  subKpi: SubKPI | null
  parentKpiName?: string
  parentDimension?: string
  onBack: () => void
}

export function SubKPIDetailPage({ subKpi, parentKpiName, parentDimension, onBack }: SubKPIDetailPageProps) {
  if (!subKpi) return null

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
                <h1 className="text-2xl font-bold text-slate-900">{subKpi.name}</h1>
                <p className="text-sm text-slate-500 mt-1">Sub-KPI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                <Target className="w-3 h-3 mr-1" />
                Sub-KPI
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Sub-KPI Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Sub-KPI Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sub-KPI Name */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-600">Sub-KPI Name</label>
                  <p className="text-base font-semibold text-slate-900 mt-2">{subKpi.name}</p>
                </div>

                {/* Sub-KPI ID */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-600">Sub-KPI ID</label>
                  <code className="text-base font-mono bg-slate-50 text-slate-900 px-3 py-2 rounded border border-slate-200 mt-2 block">
                    {subKpi.id}
                  </code>
                </div>

                {/* Annual Target */}
                {subKpi.annualTarget && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Annual Target
                    </label>
                    <p className="text-2xl font-bold text-purple-700 mt-2">{subKpi.annualTarget?.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Parent KPI Information Card */}
            {parentKpiName && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Parent KPI</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Parent KPI Name */}
                  <div>
                    <label className="text-sm font-medium text-slate-600">KPI Name</label>
                    <p className="text-base font-semibold text-slate-900 mt-2">{parentKpiName}</p>
                  </div>

                  {/* Parent Dimension */}
                  {parentDimension && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Dimension</label>
                      <div className="mt-2">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">{parentDimension}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quarterly Targets Card */}
            {subKpi.annualTarget && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Quarterly Targets</h2>

                <div className="grid grid-cols-5 gap-3">
                  {(() => {
                    const quarterValue = Math.floor(subKpi.annualTarget / 4)
                    const q4 = subKpi.annualTarget - (quarterValue * 3)
                    return [
                      { label: 'Q1', value: quarterValue },
                      { label: 'Q2', value: quarterValue },
                      { label: 'Q3', value: quarterValue },
                      { label: 'Q4', value: q4 },
                      { label: 'Annual', value: subKpi.annualTarget, isAnnual: true },
                    ]
                  })().map((quarter) => (
                    <div
                      key={quarter.label}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        quarter.isAnnual
                          ? 'border-purple-300 bg-gradient-to-b from-purple-50 to-purple-100/50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <p className={`text-xs font-bold uppercase tracking-wider ${quarter.isAnnual ? 'text-purple-700' : 'text-slate-600'}`}>
                        {quarter.label}
                      </p>
                      <p className={`text-lg font-bold mt-2 ${quarter.isAnnual ? 'text-purple-700' : 'text-slate-900'}`}>
                        {quarter.value?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge className="mt-2 bg-green-100 text-green-800 border-green-300">Active</Badge>
                </div>
              </div>
            </div>

            {/* Type Information Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Identifier</p>
                  <code className="text-slate-900 font-mono bg-slate-50 px-2 py-1 rounded block mt-1">
                    {subKpi.id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
