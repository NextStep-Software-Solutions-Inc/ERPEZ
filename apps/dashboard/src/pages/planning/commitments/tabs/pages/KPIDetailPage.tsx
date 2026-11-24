import { ArrowLeft, TrendingUp, Target, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { KPICombination } from '../types'

interface KPIDetailPageProps {
  kpi: KPICombination | null
  onBack: () => void
}

export function KPIDetailPage({ kpi, onBack }: KPIDetailPageProps) {
  if (!kpi) return null

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
                <h1 className="text-2xl font-bold text-slate-900">{kpi.kpi}</h1>
                <p className="text-sm text-slate-500 mt-1">Key Performance Indicator</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                <TrendingUp className="w-3 h-3 mr-1" />
                {kpi.dimension}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - KPI Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                KPI Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* KPI Name */}
                <div>
                  <label className="text-sm font-medium text-slate-600">KPI Name</label>
                  <p className="text-base font-semibold text-slate-900 mt-2">{kpi.kpi}</p>
                </div>

                {/* Dimension */}
                <div>
                  <label className="text-sm font-medium text-slate-600">Dimension</label>
                  <div className="mt-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">{kpi.dimension}</Badge>
                  </div>
                </div>

                {/* Annual Target */}
                {kpi.annualTarget && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Annual Target
                    </label>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{kpi.annualTarget?.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quarterly Targets Card */}
            {kpi.annualTarget && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Quarterly Targets</h2>

                <div className="grid grid-cols-5 gap-3">
                  {(() => {
                    const quarterValue = Math.floor(kpi.annualTarget / 4)
                    const q4 = kpi.annualTarget - (quarterValue * 3)
                    return [
                      { label: 'Q1', value: quarterValue },
                      { label: 'Q2', value: quarterValue },
                      { label: 'Q3', value: quarterValue },
                      { label: 'Q4', value: q4 },
                      { label: 'Annual', value: kpi.annualTarget, isAnnual: true },
                    ]
                  })().map((quarter) => (
                    <div
                      key={quarter.label}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        quarter.isAnnual
                          ? 'border-blue-300 bg-gradient-to-b from-blue-50 to-blue-100/50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <p className={`text-xs font-bold uppercase tracking-wider ${quarter.isAnnual ? 'text-blue-700' : 'text-slate-600'}`}>
                        {quarter.label}
                      </p>
                      <p className={`text-lg font-bold mt-2 ${quarter.isAnnual ? 'text-blue-700' : 'text-slate-900'}`}>
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
                  <p className="text-sm text-slate-600">Total Sub-KPIs</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.subKpis?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Sub-KPIs List Card */}
            {kpi.subKpis && kpi.subKpis.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Sub-KPIs</h3>
                <div className="space-y-3">
                  {kpi.subKpis.map((subKpi, index) => (
                    <div key={subKpi.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                      <Badge variant="outline" className="text-purple-700 border-purple-300 mt-1">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{subKpi.name}</p>
                        {subKpi.annualTarget && (
                          <p className="text-sm text-slate-600 mt-1">
                            Target: <span className="font-semibold text-slate-900">{subKpi.annualTarget?.toLocaleString()}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
