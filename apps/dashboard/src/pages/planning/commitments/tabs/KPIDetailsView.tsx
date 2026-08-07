import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowLeft, TrendingUp, Globe, Tag } from 'lucide-react'
import { FYActiveKpi } from '@/features/planning/fiscal-year-and-policies/fy-active-kpi/types/types'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getKpiTargetsRequest } from '@/features/planning/master-kpi/handlers/getKpiTargetsRequest'

const useKpiTargets = createQueryHookFromTemplate(getKpiTargetsRequest)

interface KPIDetailsViewProps {
  kpi: FYActiveKpi
}

const getStatusColor = (status: string | null) => {
  if (!status) return 'bg-gray-100 text-gray-800'
  const normalized = status.toLowerCase()
  switch (normalized) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    case 'archived':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

export function KPIDetailsView({ kpi }: KPIDetailsViewProps) {
  const navigation = useNavigate({ from: '/v2/commitments' })
  const searchParams = useSearch({ from: '/v2/commitments/' })

  // Fetch KPI targets filtered by kpiId
  const { data: targetsData, isLoading: isLoadingTargets } = useKpiTargets({
    pathParams: {},
    queryParams: {
      filters: `kpiId==${kpi.id}`,
    },
  })

  const targets = targetsData?.data || []

  const handleBack = () => {
    navigation({
      search: {
        ...searchParams,
        kpiId: undefined,
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {kpi?.name || 'Unnamed KPI'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">
                    KPI ID: {kpi?.code}
                  </span>
                  {kpi?.status && (
                    <Badge className={`${getStatusColor(kpi.status)} text-xs`}>
                      {kpi.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {kpi?.status && (
              <Badge
                className={`${getStatusColor(kpi.status)} text-sm px-3 py-1`}
              >
                {kpi.status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* KPI Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">i</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                KPI Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* KPI Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  KPI Name
                </label>
                <p className="text-sm text-gray-900 font-semibold">
                  {kpi?.name || '-'}
                </p>
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Description
                </label>
                <p className="text-sm text-gray-600">
                  {kpi?.description || '-'}
                </p>
              </div>

              {/* Function Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Function Type
                </label>
                <p className="text-sm text-gray-900 font-semibold">
                  {kpi?.functionCategory || '-'}
                </p>
              </div>

              {/* Fiscal Year */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Fiscal Year
                </label>
                <p className="text-sm text-gray-900 font-semibold">
                  {kpi?.fiscalYearId ? 'FY ' + kpi.fiscalYearId : '-'}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Status
                </label>
                <Badge className={`${getStatusColor(kpi?.status)} text-xs`}>
                  {kpi?.status || '-'}
                </Badge>
              </div>

              {/* Is Percentage */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Is Percentage
                </label>
                <Badge
                  variant="outline"
                  className="text-xs bg-gray-50 text-gray-700"
                >
                  {kpi?.isOptInAvailable ? 'No' : 'No'}
                </Badge>
              </div>

              {/* Is Fixed */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Is Fixed
                </label>
                <Badge
                  variant="outline"
                  className="text-xs bg-gray-50 text-gray-700"
                >
                  No
                </Badge>
              </div>

              {/* Is Target Allocable */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Is Target Allocable
                </label>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    kpi?.isOptInAvailable
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  {kpi?.isOptInAvailable ? 'Yes' : 'No'}
                </Badge>
              </div>

              {/* Is Average */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Is Average
                </label>
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-50 text-purple-700"
                >
                  Yes
                </Badge>
              </div>

              {/* Is Global */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Is Global
                </label>
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700"
                >
                  Yes
                </Badge>
              </div>

              {/* Is Mandatory */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Is Mandatory
                </label>
                <Badge
                  variant="outline"
                  className="text-xs bg-red-50 text-red-700"
                >
                  No
                </Badge>
              </div>
            </div>
          </div>

          {/* Target Information & Periods */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Target Information & Periods
              </h2>
            </div>

            {/* Timeline Type */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Timeline Type
              </label>
              <Badge className="bg-blue-100 text-blue-800 text-xs px-3 py-1">
                Annual
              </Badge>
            </div>

            {/* Periods Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">
                      Period
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">
                      Quarter
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">
                      Target Value
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">
                      Remaining
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {targets && targets.length > 0 ? (
                    targets.map((target, idx) => (
                      <tr
                        key={target.id || idx}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                          {target.period || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {target.quarterName || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                          {target.targetValue || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {target.remainingTargetValue || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-sm text-gray-500"
                      >
                        {isLoadingTargets
                          ? 'Loading targets...'
                          : 'No targets available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Total Target
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {targets.length > 0
                    ? targets
                        .reduce(
                          (sum, target) => sum + (target.targetValue || 0),
                          0,
                        )
                        .toFixed(1)
                    : '-'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Average
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {targets.length > 0
                    ? (
                        targets.reduce(
                          (sum, target) => sum + (target.targetValue || 0),
                          0,
                        ) / targets.length
                      ).toFixed(1)
                    : '-'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Highest
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {targets.length > 0
                    ? Math.max(
                        ...targets.map((t) => t.targetValue || 0),
                      ).toFixed(1)
                    : '-'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-2">Lowest</p>
                <p className="text-2xl font-bold text-gray-900">
                  {targets.length > 0
                    ? Math.min(
                        ...targets.map((t) => t.targetValue || 0),
                      ).toFixed(1)
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Dimension Criteria & Rating Scale */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Dimension Criteria & Rating Scale
              </h2>
            </div>

            <div className="space-y-8">
              {/* Quality Dimension */}
              <div>
                <Badge className="mb-4 bg-green-100 text-green-800 text-xs px-3 py-1">
                  Quality
                </Badge>
                <div className="space-y-3">
                  {[
                    {
                      rating: 1,
                      description: 'Poor - Cost reduction below 2%',
                    },
                    { rating: 2, description: 'Fair - Cost reduction 2-5%' },
                    {
                      rating: 3,
                      description: 'Acceptable - Cost reduction 5-8%',
                    },
                    { rating: 4, description: 'Good - Cost reduction 8-10%' },
                    {
                      rating: 5,
                      description: 'Excellent - Cost reduction above 10%',
                    },
                  ].map((item) => (
                    <div key={item.rating} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-red-700">
                          {item.rating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 pt-0.5">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Efficiency Dimension */}
              <div>
                <Badge className="mb-4 bg-blue-100 text-blue-800 text-xs px-3 py-1">
                  Efficiency
                </Badge>
                <div className="space-y-3">
                  {[
                    {
                      rating: 1,
                      description: 'Poor - Implementation efficiency below 40%',
                    },
                    {
                      rating: 2,
                      description: 'Fair - Implementation efficiency 40-60%',
                    },
                    {
                      rating: 3,
                      description:
                        'Acceptable - Implementation efficiency 60-75%',
                    },
                    {
                      rating: 4,
                      description: 'Good - Implementation efficiency 75-90%',
                    },
                    {
                      rating: 5,
                      description:
                        'Excellent - Implementation efficiency above 90%',
                    },
                  ].map((item) => (
                    <div key={item.rating} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-blue-700">
                          {item.rating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 pt-0.5">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SDG Association */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                SDG Association
              </h2>
            </div>

            {kpi.SDGs && kpi.SDGs.length > 0 ? (
              <div className="space-y-4">
                {kpi.SDGs.map((sdg) => (
                  <div
                    key={sdg.id}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-2">
                        SDG Name
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {sdg.name || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-2">
                        SDG Code
                      </label>
                      <p className="text-sm font-semibold text-gray-900"></p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-2">
                        ID
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {sdg.id || '-'}
                      </p>
                    </div>
                    <div className="lg:col-span-4">
                      <label className="text-xs font-medium text-gray-600 block mb-2">
                        Description
                      </label>
                      <p className="text-sm text-gray-600">
                        {sdg.description || '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No SDG association</p>
            )}
          </div>

          {/* Associated Attributes (KPIAttribute) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-pink-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Associated Attributes (KPIAttribute)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">
                      NAME
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">
                      CODE
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 bg-gray-50">
                      DESCRIPTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {kpi?.Attributes && kpi.Attributes.length > 0 ? (
                    kpi.Attributes.map((attr, idx) => (
                      <tr
                        key={attr.id || idx}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {attr.name || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {attr.code || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {attr.description || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-sm text-gray-500"
                      >
                        No attributes associated with this KPI
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Measurement Unit */}
          {kpi?.measurementUnit && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Measurement Unit
              </h3>
              <p className="text-sm text-gray-600">{kpi.measurementUnit}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
