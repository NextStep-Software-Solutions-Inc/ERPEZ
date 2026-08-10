import { ArrowLeft, Target, Code, Calendar, Tag, Grid3x3, TrendingUp, Lock, Globe, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type TimelineType = 'Quarterly' | 'Annual' | 'Monthly' | 'Custom'
type DimensionType = 'Quality' | 'Efficiency' | 'Timeliness'

interface RatingCriteria {
  rating: 1 | 2 | 3 | 4 | 5
  description: string
}

interface DimensionCriteria {
  dimensionType: DimensionType
  isMandatory: boolean
  ratingTable: RatingCriteria[]
}

interface TargetPeriod {
  id: number
  periodName: string
  value: number
  startDate: string
  endDate: string
  isLocked: boolean
}

interface KPITarget {
  id: number
  kpiId: number
  kpiName: string
  description: string
  dimension: DimensionType
  dimensionCriteria?: DimensionCriteria[]
  functionType: 'core function' | 'strategic function' | 'mandatory function'
  timelineType: TimelineType
  office: string
  fiscalYear: number
  isPercentage: boolean
  isFixed: boolean
  isTargetAllocable: boolean
  isAverage: boolean
  isGlobal: boolean
  isActive: boolean
  parentKPIId?: number
  parentKPIName?: string
  weight: number
  isMandatory: boolean
  isWeightLocked: boolean
  isLocked: boolean
  createdBy: 'Planning' | 'DU'
  lastUpdated: string
  targetPeriods: TargetPeriod[]
  sdgId?: number
  sdgName?: string
  sdgCode?: string
  sdgDescription?: string
  attributes?: {
    id: number
    name: string
    code: string
    description: string
    parentAttributeId?: number
    parentAttributeName?: string
  }[]
}

interface StrategicTargetDetailPageProps {
  item: KPITarget | null
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

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function StrategicTargetDetailPage({ item, onBack }: StrategicTargetDetailPageProps) {
  if (!item) return null

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
                <h1 className="text-2xl font-bold text-slate-900">{item.kpiName}</h1>
                <p className="text-sm text-slate-500 mt-1">
                  KPI ID: {item.kpiId} • Target ID: {item.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.isActive && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
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
          {/* SECTION 1 — KPI BASIC INFORMATION */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              KPI Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* KPI Name */}
              <div>
                <label className="text-sm font-medium text-slate-600">KPI Name</label>
                <p className="text-base font-semibold text-slate-900 mt-2">{item.kpiName}</p>
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="text-sm font-medium text-slate-600">Description</label>
                <p className="text-base text-slate-800 mt-2">{item.description || '—'}</p>
              </div>

              {/* Function Type */}
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Function Type
                </label>
                <p className="text-base font-semibold text-slate-900 mt-2">{item.functionType}</p>
              </div>

              {/* Fiscal Year */}
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fiscal Year
                </label>
                <p className="text-base font-semibold text-slate-900 mt-2">{item.fiscalYear}</p>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="mt-2">
                  <Badge variant="outline" className={item.isActive ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* IsPercentage */}
              <div>
                <label className="text-sm font-medium text-slate-600">Is Percentage</label>
                <div className="mt-2">
                  <Badge variant="outline" className={item.isPercentage ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-700 border-gray-300'}>
                    {item.isPercentage ? 'Yes (%)' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* IsFixed */}
              <div>
                <label className="text-sm font-medium text-slate-600">Is Fixed</label>
                <div className="mt-2">
                  <Badge variant="outline" className={item.isFixed ? 'bg-orange-50 text-orange-700 border-orange-300' : 'bg-gray-50 text-gray-700 border-gray-300'}>
                    {item.isFixed ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* IsTargetAllocable */}
              <div>
                <label className="text-sm font-medium text-slate-600">Is Target Allocable</label>
                <div className="mt-2">
                  <Badge variant="outline" className={item.isTargetAllocable ? 'bg-green-50 text-green-700 border-green-300' : 'bg-gray-50 text-gray-700 border-gray-300'}>
                    {item.isTargetAllocable ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* IsAverage */}
              <div>
                <label className="text-sm font-medium text-slate-600">Is Average</label>
                <div className="mt-2">
                  <Badge variant="outline" className={item.isAverage ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-gray-50 text-gray-700 border-gray-300'}>
                    {item.isAverage ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* IsGlobal */}
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Is Global
                </label>
                <div className="mt-2">
                  <Badge variant="outline" className={item.isGlobal ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-gray-50 text-gray-700 border-gray-300'}>
                    {item.isGlobal ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* Is Mandatory */}
              <div>
                <label className="text-sm font-medium text-slate-600">Is Mandatory</label>
                <div className="mt-2">
                  <Badge variant="outline" className={item.isMandatory ? 'bg-red-50 text-red-700 border-red-300' : 'bg-gray-50 text-gray-700 border-gray-300'}>
                    {item.isMandatory ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* Parent KPI */}
              {item.parentKPIId && (
                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Parent KPI
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">{item.parentKPIName}</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2 — TARGET INFORMATION (Dynamic by TimelineType) */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Target Information & Periods
            </h2>

            {/* Timeline Type Display */}
            <div className="mb-6 pb-6 border-b border-slate-200">
              <label className="text-sm font-medium text-slate-600 block mb-2">Timeline Type</label>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-base py-2 px-3">
                {item.timelineType}
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
                  {item.targetPeriods.map((period) => (
                    <TableRow key={period.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">{period.periodName}</TableCell>
                      <TableCell className="text-slate-700">{formatDate(period.startDate)}</TableCell>
                      <TableCell className="text-slate-700">{formatDate(period.endDate)}</TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">{period.value}</TableCell>
                      <TableCell className="text-center">
                        <Lock className="h-4 w-4 text-blue-500 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
              <div className="text-center">
                <label className="text-xs font-medium text-slate-600 block mb-2">Total Target</label>
                <p className="text-2xl font-bold text-slate-900">
                  {item.targetPeriods.reduce((sum, p) => sum + p.value, 0)}
                </p>
              </div>
              <div className="text-center">
                <label className="text-xs font-medium text-slate-600 block mb-2">Average</label>
                <p className="text-2xl font-bold text-slate-900">
                  {(item.targetPeriods.reduce((sum, p) => sum + p.value, 0) / item.targetPeriods.length).toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <label className="text-xs font-medium text-slate-600 block mb-2">Highest</label>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.max(...item.targetPeriods.map(p => p.value))}
                </p>
              </div>
              <div className="text-center">
                <label className="text-xs font-medium text-slate-600 block mb-2">Lowest</label>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.min(...item.targetPeriods.map(p => p.value))}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4 — DIMENSION CRITERIA RATINGS */}
          {item.dimensionCriteria && item.dimensionCriteria.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Grid3x3 className="w-5 h-5 text-indigo-600" />
                Dimension Criteria & Rating Scale
              </h2>

              <div className="space-y-8">
                {item.dimensionCriteria.map((dimension, dimIndex) => (
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
                          {dimension.ratingTable.map((rating) => (
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

          {/* SECTION 5 — SDG ASSOCIATION */}
          {item.sdgId && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-cyan-600" />
                SDG Association
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-600">SDG Name</label>
                  <p className="text-base font-semibold text-slate-900 mt-2">{item.sdgName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">SDG Code</label>
                  <p className="text-base font-mono font-semibold text-slate-900 mt-2">{item.sdgCode}</p>
                </div>

                <div className="md:col-span-1">
                  <label className="text-sm font-medium text-slate-600">ID</label>
                  <p className="text-base font-mono font-semibold text-slate-900 mt-2">{item.sdgId}</p>
                </div>

                <div className="md:col-span-3">
                  <label className="text-sm font-medium text-slate-600">Description</label>
                  <p className="text-base text-slate-800 mt-2">{item.sdgDescription || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5 — ATTRIBUTES */}
          {item.attributes && item.attributes.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Grid3x3 className="w-5 h-5 text-pink-600" />
                Associated Attributes (KPIAttribute)
              </h2>

              <div className="space-y-4">
                {item.attributes.map((attr) => (
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