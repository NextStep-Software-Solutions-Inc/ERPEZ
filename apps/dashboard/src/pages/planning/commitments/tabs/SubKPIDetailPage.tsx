import { ArrowLeft, Code, FileText, CheckCircle2, Calendar, Globe, Link as LinkIcon, Grid3x3, TrendingUp, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

interface SubKPIDetailPageProps {
  subKpi: any
  onBack: () => void
}

export function SubKPIDetailPage({ subKpi, onBack }: SubKPIDetailPageProps) {
  if (!subKpi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">No Sub-KPI data available</p>
          </div>
        </div>
      </div>
    )
  }

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
                <h1 className="text-2xl font-bold text-slate-900">{subKpi.kpiName || subKpi.name}</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Sub-KPI ID: {subKpi.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {subKpi.isActive && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* SECTION 1 — SUB-KPI BASIC INFORMATION */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Sub-KPI Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sub-KPI Name */}
              <div>
                <label className="text-sm font-medium text-slate-600">Sub-KPI Name</label>
                <p className="text-base font-semibold text-slate-900 mt-2">{subKpi.kpiName || subKpi.name}</p>
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="text-sm font-medium text-slate-600">Description</label>
                <p className="text-base text-slate-800 mt-2">{subKpi.description || '—'}</p>
              </div>

              {/* Function Type */}
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Function Type
                </label>
                <p className="text-base font-semibold text-slate-900 mt-2">{subKpi.functionType ?? subKpi.parentKPI?.functionType ?? 'N/A'}</p>
              </div>

              {/* Dimension */}
              <div>
                <label className="text-sm font-medium text-slate-600">Dimension</label>
                <div className="mt-2">
                  <Badge variant="outline" className={getDimensionClasses(subKpi.dimension ?? subKpi.parentKPI?.dimension ?? '')}>
                    {subKpi.dimension ?? subKpi.parentKPI?.dimension ?? 'N/A'}
                  </Badge>
                </div>
              </div>

              {/* Parent KPI ID */}
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Parent KPI ID
                </label>
                <p className="text-base font-semibold text-slate-900 mt-2">{subKpi.parentKPIId ?? subKpi.parentKPI?.kpiId ?? 'N/A'}</p>
              </div>

              {/* Fiscal Year */}
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fiscal Year
                </label>
                <p className="text-base font-semibold text-slate-900 mt-2">{subKpi.fiscalYear ?? subKpi.parentKPI?.fiscalYear ?? '—'}</p>
              </div>

              {/* Is Percentage */}
              <div>
                <label className="text-sm font-medium text-slate-600">Is Percentage</label>
                <div className="mt-2">
                  <Badge variant="outline" className={(subKpi.isPercentage ?? subKpi.parentKPI?.isPercentage) ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-700 border-gray-300'}>
                    {(subKpi.isPercentage ?? subKpi.parentKPI?.isPercentage) ? 'Yes (%)' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* Is Fixed */}
              <div>
                <label className="text-sm font-medium text-slate-600">Is Fixed</label>
                <div className="mt-2">
                  <Badge variant="outline" className={(subKpi.isFixed ?? subKpi.parentKPI?.isFixed) ? 'bg-orange-50 text-orange-700 border-orange-300' : 'bg-gray-50 text-gray-700 border-gray-300'}>
                    {(subKpi.isFixed ?? subKpi.parentKPI?.isFixed) ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* Is Target Allocable */}
              <div>
                <label className="text-sm font-medium text-slate-600">Is Target Allocable</label>
                <div className="mt-2">
                  <Badge variant="outline" className={(subKpi.isTargetAllocable ?? subKpi.parentKPI?.isTargetAllocable) ? 'bg-green-50 text-green-700 border-green-300' : 'bg-gray-50 text-gray-700 border-gray-300'}>
                    {(subKpi.isTargetAllocable ?? subKpi.parentKPI?.isTargetAllocable) ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* Is Global */}
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Is Global
                </label>
                <div className="mt-2">
                  <Badge variant="outline" className={(subKpi.isGlobal ?? subKpi.parentKPI?.isGlobal) ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-gray-50 text-gray-700 border-gray-300'}>
                    {(subKpi.isGlobal ?? subKpi.parentKPI?.isGlobal) ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* Is Mandatory */}
              <div>
                <label className="text-sm font-medium text-slate-600">Is Mandatory</label>
                <div className="mt-2">
                  <Badge variant="outline" className={(subKpi.isMandatory ?? subKpi.parentKPI?.isMandatory) ? 'bg-red-50 text-red-700 border-red-300' : 'bg-gray-50 text-gray-700 border-gray-300'}>
                    {(subKpi.isMandatory ?? subKpi.parentKPI?.isMandatory) ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="mt-2">
                  <Badge variant="outline" className={(subKpi.isActive ?? subKpi.parentKPI?.isActive) ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}>
                    {(subKpi.isActive ?? subKpi.parentKPI?.isActive) ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 — TARGET INFORMATION & PERIODS */}
          {(subKpi.targetPeriods?.length > 0 || subKpi.parentKPI?.targetPeriods?.length > 0) && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Target Information & Periods
              </h2>

              {/* Timeline Type Display */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <label className="text-sm font-medium text-slate-600 block mb-2">Timeline Type</label>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-base py-2 px-3">
                  {subKpi.timelineType ?? subKpi.parentKPI?.timelineType ?? 'N/A'}
                </Badge>
              </div>

              {/* Dynamic Target Periods Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-slate-600 font-semibold">Period Name</TableHead>
                      <TableHead className="text-slate-600 font-semibold">Start Date</TableHead>
                      <TableHead className="text-slate-600 font-semibold">End Date</TableHead>
                      <TableHead className="text-slate-600 font-semibold text-right">Target Value</TableHead>
                      <TableHead className="text-slate-600 font-semibold text-center">Lock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(subKpi.targetPeriods?.length > 0 ? subKpi.targetPeriods : subKpi.parentKPI?.targetPeriods ?? []).map((period: any) => (
                      <TableRow key={period.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-900">{period.periodName}</TableCell>
                        <TableCell className="text-slate-700">{formatDate(period.startDate)}</TableCell>
                        <TableCell className="text-slate-700">{formatDate(period.endDate)}</TableCell>
                        <TableCell className="text-right font-semibold text-slate-900">{period.value}</TableCell>
                        <TableCell className="text-center">
                          {period.isLocked ? (
                            <span className="text-amber-600">🔒</span>
                          ) : (
                            <span className="text-gray-400">🔓</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* SECTION 3 — DIMENSION CRITERIA & RATING SCALE */}
          {(subKpi.dimensionCriteria?.length > 0 || subKpi.parentKPI?.dimensionCriteria?.length > 0) && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Grid3x3 className="w-5 h-5 text-indigo-600" />
                Dimension Criteria & Rating Scale
              </h2>

              <div className="space-y-8">
                {(subKpi.dimensionCriteria?.length > 0 ? subKpi.dimensionCriteria : subKpi.parentKPI?.dimensionCriteria ?? []).map((dimension: any, dimIndex: number) => (
                  <div key={dimIndex} className="border border-slate-200 rounded-lg p-6 bg-slate-50">
                    {/* Dimension Header */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`${getDimensionClasses(dimension.dimensionType)} text-base py-2 px-3`}>
                          {dimension.dimensionType}
                        </Badge>
                      </div>
                    </div>

                    {/* Rating Table */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-white">
                            <TableHead className="text-slate-600 font-semibold w-20">Rating</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dimension.ratingTable.map((rating: any) => (
                            <TableRow key={rating.rating} className="hover:bg-white border-b border-slate-100">
                              <TableCell className="font-bold text-center">
                                <Badge 
                                  variant="outline" 
                                  className={
                                    rating.rating === 5 ? 'bg-green-100 text-green-800 border-green-300' :
                                    rating.rating === 4 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                    rating.rating === 3 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                    rating.rating === 2 ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                    'bg-red-100 text-red-800 border-red-300'
                                  }
                                >
                                  {rating.rating}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-700">{rating.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4 — SDG ASSOCIATION */}
          {(subKpi.sdgId ?? subKpi.parentKPI?.sdgId) && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-cyan-600" />
                SDG Association
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-600">SDG Name</label>
                  <p className="text-base font-semibold text-slate-900 mt-2">{subKpi.sdgName ?? subKpi.parentKPI?.sdgName ?? '—'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">SDG Code</label>
                  <p className="text-base font-mono font-semibold text-slate-900 mt-2">{subKpi.sdgCode ?? subKpi.parentKPI?.sdgCode ?? '—'}</p>
                </div>

                <div className="md:col-span-1">
                  <label className="text-sm font-medium text-slate-600">ID</label>
                  <p className="text-base font-mono font-semibold text-slate-900 mt-2">{subKpi.sdgId ?? subKpi.parentKPI?.sdgId ?? '—'}</p>
                </div>

                <div className="md:col-span-3">
                  <label className="text-sm font-medium text-slate-600">Description</label>
                  <p className="text-base text-slate-800 mt-2">{subKpi.sdgDescription ?? subKpi.parentKPI?.sdgDescription ?? '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5 — ATTRIBUTES */}
          {((subKpi.attributes?.length ?? 0) > 0 || (subKpi.parentKPI?.attributes?.length ?? 0) > 0) && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Grid3x3 className="w-5 h-5 text-pink-600" />
                Associated Attributes (KPIAttribute)
              </h2>

              <div className="space-y-4">
                {((subKpi.attributes?.length ?? 0) > 0 ? subKpi.attributes : subKpi.parentKPI?.attributes ?? []).map((attr: any) => (
                  <div key={attr.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Name</label>
                        <p className="text-base font-semibold text-slate-900 mt-1">{attr.name}</p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Code</label>
                        <p className="text-base font-mono text-slate-900 mt-1">{attr.code}</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Description</label>
                        <p className="text-base text-slate-800 mt-1">{attr.description || '—'}</p>
                      </div>

                      {attr.parentAttributeId && (
                        <div className="md:col-span-4">
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Parent Attribute</label>
                          <p className="text-base font-semibold text-slate-900 mt-1 flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-slate-500" />
                            {attr.parentAttributeName}
                          </p>
                        </div>
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
  )
}