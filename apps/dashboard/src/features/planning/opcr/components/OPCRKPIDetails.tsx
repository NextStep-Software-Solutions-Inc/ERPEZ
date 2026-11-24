import { getKpiAssignmentRequest } from '@/components/features/planning/kpi-assignment-for-du/handlers/getKpiAssignmentRequest'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import {
  ArrowLeft,
  Award,
  Target,
  Lock,
  Gauge,
  Clock,
  CheckCircle2,
  Info,
} from 'lucide-react'
import type { KPIAssignmentDetails } from '@/features/planning/kpi-assignment'
import { FYActiveKPIMeasurement } from '../../fiscal-year-and-policies/fy-active-kpi/types/types.measurement'
import { Attribute } from '@/components/features/planning/attribute/types'
import { SDG } from '@/components/features/planning/SDGs/types'

const useKPIAssignment = createQueryHookFromTemplate(getKpiAssignmentRequest)

export function OPCRKPIDetails({
  hideButton,
  kpiAssignmentId,
  source = 'kpiassignment',
}: {
  hideButton?: boolean
  kpiAssignmentId: string
  source?: 'kpiassignment' | 'strategicTarget' | 'opcr'
}) {
  const navigation = useNavigate({ from: '/v2/commitments/' })
  const searchParams = useSearch({ from: '/v2/commitments/' })
  const { data: kpiAssignmentData, isPending } = useKPIAssignment({
    pathParams: { id: kpiAssignmentId },
    queryParams: {},
  })
  // The hook returns APIResponse<KPIAssignmentDetails>, so data is KPIAssignmentDetails
  const kpiData: KPIAssignmentDetails | undefined = kpiAssignmentData?.data

  // Show skeleton only while pending
  if (isPending) {
    return (
      <div className="min-h-screen bg-white p-6 space-y-6" data-source={source}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-80" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 col-span-2 rounded-xl" />
            <Skeleton className="h-48 col-span-1 rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // Show error/empty state when data is missing after loading completes
  if (!kpiData) {
    return (
      <div className="min-h-screen bg-white p-6" data-source={source}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div className="space-y-2">
              {!hideButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigation({
                      search: {
                        ...searchParams,
                        kpiAssignmentId: undefined,
                      },
                    })
                  }}
                  className="hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚠️</div>
              <h2 className="text-2xl font-bold text-slate-900">
                Unable to Load KPI Details
              </h2>
              <p className="text-slate-600 max-w-sm">
                The KPI assignment data could not be loaded. Please try again or
                contact support if the problem persists.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  navigation({
                    search: {
                      ...searchParams,
                      kpiAssignmentId: undefined,
                    },
                  })
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // console.log({ kpiData: kpiData?. })
  return (
    <div className="min-h-screen bg-white" data-source={source}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!hideButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigation({
                      search: {
                        ...searchParams,
                        kpiAssignmentId: undefined,
                      },
                    })
                  }}
                  className="hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {kpiData?.fyActiveKPI?.name || 'Unnamed KPI'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-slate-500">
                    {kpiData?.fyActiveKPI?.code &&
                      `Code: ${kpiData.fyActiveKPI.code}`}
                  </p>
                  {kpiData?.year && (
                    <span className="text-sm text-slate-500">
                      • {kpiData.year}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {kpiData?.fyActiveKPI?.functionCategory && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  {kpiData.fyActiveKPI.functionCategory}
                </Badge>
              )}
              {kpiData?.fyActiveKPI?.status && (
                <Badge
                  className={`${
                    kpiData.fyActiveKPI.status.toLowerCase() === 'active'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                >
                  {kpiData.fyActiveKPI.status}
                </Badge>
              )}
              {kpiData?.isLocked && (
                <Badge className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Locked
                </Badge>
              )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* KPI Name */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    KPI Name
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">
                    {kpiData?.fyActiveKPI?.name || 'N/A'}
                  </p>
                </div>

                {/* KPI Code */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    KPI Code
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">
                    {kpiData?.fyActiveKPI?.code || 'N/A'}
                  </p>
                </div>

                {/* Function Category */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Function Category
                  </label>
                  <div className="mt-2">
                    {kpiData?.fyActiveKPI?.functionCategory ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        {kpiData.fyActiveKPI.functionCategory}
                      </Badge>
                    ) : (
                      <p className="text-slate-500">N/A</p>
                    )}
                  </div>
                </div>

                {/* Fiscal Year */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Fiscal Year
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">
                    {kpiData?.year || 'N/A'}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Status
                  </label>
                  <div className="mt-2">
                    {kpiData?.fyActiveKPI?.status ? (
                      <Badge
                        className={`${
                          kpiData.fyActiveKPI.status.toLowerCase() === 'active'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}
                      >
                        {kpiData.fyActiveKPI.status}
                      </Badge>
                    ) : (
                      <p className="text-slate-500">N/A</p>
                    )}
                  </div>
                </div>

                {/* Measurement Unit */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Measurement Unit
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">
                    {kpiData?.fyActiveKPI?.measurementUnit || 'N/A'}
                  </p>
                </div>

                {/* Distribution Behavior */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Distribution Behavior
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">
                    {kpiData?.fyActiveKPI?.distributionBehavior || 'N/A'}
                  </p>
                </div>

                {/* Monitoring Frequency */}
                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Monitoring Frequency
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">
                    {kpiData?.fyActiveKPI?.monitoringFrequency || 'N/A'}
                  </p>
                </div>

                {/* Locked Status */}
                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    Locked
                  </label>
                  <div className="mt-2">
                    <Badge
                      className={`${
                        kpiData?.isLocked
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-green-100 text-green-800 border-green-300'
                      }`}
                    >
                      {kpiData?.isLocked ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                {/* GAD Status */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Gender and Development (GAD)
                  </label>
                  <div className="mt-2">
                    <Badge
                      className={`${
                        kpiData?.fyActiveKPI?.isGAD
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-gray-100 text-gray-800 border-gray-300'
                      }`}
                    >
                      {kpiData?.fyActiveKPI?.isGAD ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                {/* Optional */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Optional (Opt-In Available)
                  </label>
                  <div className="mt-2">
                    <Badge
                      className={`${
                        kpiData?.fyActiveKPI?.isOptInAvailable
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-gray-100 text-gray-800 border-gray-300'
                      }`}
                    >
                      {kpiData?.fyActiveKPI?.isOptInAvailable ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              {kpiData?.fyActiveKPI?.description && (
                <div className="border-t mt-6 pt-6">
                  <label className="text-sm font-medium text-slate-600">
                    Description
                  </label>
                  <p className="text-sm text-slate-700 mt-2">
                    {kpiData?.fyActiveKPI?.MFOPAP?.name}
                  </p>
                </div>
              )}

              {/* MFOPAP Information */}
              {kpiData?.fyActiveKPI?.MFOPAP && (
                <div className="border-t mt-6 pt-6">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    <Info className="w-4 h-4" />
                    Organization/Program/Activity/Project (MFOPAP)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">
                        Name
                      </p>
                      <p className="text-sm font-medium text-slate-900 mt-1">
                        {kpiData?.fyActiveKPI?.MFOPAP?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">
                        Code
                      </p>
                      <p className="text-sm font-medium text-slate-900 mt-1">
                        {kpiData?.fyActiveKPI?.MFOPAP?.code || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">
                        Type
                      </p>
                      <p className="text-sm font-medium text-slate-900 mt-1">
                        {kpiData?.fyActiveKPI?.MFOPAP?.type || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Agency vs Assigned Targets */}
            {(() => {
              const agencyAnnual = kpiData?.fyActiveKPI?.agencyTargetAnnual || 0
              const agencyQ1 = kpiData?.fyActiveKPI?.agencyTargetQ1
              const agencyQ2 = kpiData?.fyActiveKPI?.agencyTargetQ2
              const agencyQ3 = kpiData?.fyActiveKPI?.agencyTargetQ3
              const agencyQ4 = kpiData?.fyActiveKPI?.agencyTargetQ4
              const assignedAnnual = kpiData?.assignedTargetAnnual || 0
              const assignedQ1 = kpiData?.assignedTargetQ1
              const assignedQ2 = kpiData?.assignedTargetQ2
              const assignedQ3 = kpiData?.assignedTargetQ3
              const assignedQ4 = kpiData?.assignedTargetQ4

              const hasAgencyTarget =
                agencyAnnual > 0 || agencyQ1 || agencyQ2 || agencyQ3 || agencyQ4
              const hasAssignedTarget =
                assignedAnnual > 0 ||
                assignedQ1 ||
                assignedQ2 ||
                assignedQ3 ||
                assignedQ4

              return (
                (hasAgencyTarget || hasAssignedTarget) && (
                  <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600" />
                      Target Comparison
                    </h2>

                    <div className="space-y-6">
                      {/* Agency Targets */}
                      {hasAgencyTarget && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700 mb-3">
                            Agency-Level Targets
                          </h3>
                          <div className="grid grid-cols-5 gap-3">
                            {[
                              { label: 'Q1', value: agencyQ1 },
                              { label: 'Q2', value: agencyQ2 },
                              { label: 'Q3', value: agencyQ3 },
                              { label: 'Q4', value: agencyQ4 },
                              {
                                label: 'Annual',
                                value: agencyAnnual,
                                isAnnual: true,
                              },
                            ].map((quarter) => (
                              <div
                                key={quarter.label}
                                className={`p-3 rounded-lg border-2 text-center ${
                                  quarter.isAnnual
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-slate-200 bg-slate-50'
                                }`}
                              >
                                <p
                                  className={`text-xs font-bold uppercase ${
                                    quarter.isAnnual
                                      ? 'text-green-700'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {quarter.label}
                                </p>
                                <p
                                  className={`text-sm font-bold mt-1 ${
                                    quarter.isAnnual
                                      ? 'text-green-700'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {quarter.value?.toLocaleString() || '—'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assigned Targets */}
                      {hasAssignedTarget && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700 mb-3">
                            Assigned Targets
                          </h3>
                          <div className="grid grid-cols-5 gap-3">
                            {[
                              { label: 'Q1', value: assignedQ1 },
                              { label: 'Q2', value: assignedQ2 },
                              { label: 'Q3', value: assignedQ3 },
                              { label: 'Q4', value: assignedQ4 },
                              {
                                label: 'Annual',
                                value: assignedAnnual,
                                isAnnual: true,
                              },
                            ].map((quarter) => (
                              <div
                                key={quarter.label}
                                className={`p-3 rounded-lg border-2 text-center ${
                                  quarter.isAnnual
                                    ? 'border-blue-300 bg-blue-50'
                                    : 'border-slate-200 bg-slate-50'
                                }`}
                              >
                                <p
                                  className={`text-xs font-bold uppercase ${
                                    quarter.isAnnual
                                      ? 'text-blue-700'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {quarter.label}
                                </p>
                                <p
                                  className={`text-sm font-bold mt-1 ${
                                    quarter.isAnnual
                                      ? 'text-blue-700'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {quarter.value?.toLocaleString() || '—'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )
            })()}
          </div>

          {/* Right Column - Overview & Additional Info */}
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Overview
              </h3>
              <div className="space-y-3">
                {kpiData?.fyActiveKPI &&
                  (kpiData?.fyActiveKPI?.FYActiveKPIMeasurements || []).length >
                    0 && (
                    <div>
                      <p className="text-sm text-slate-600">Measurements</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {kpiData?.fyActiveKPI?.FYActiveKPIMeasurements
                          ?.length || 0}
                      </p>
                    </div>
                  )}
                {kpiData?.assignedTargetAnnual &&
                  kpiData.assignedTargetQ1 !== undefined && (
                    <div>
                      <p className="text-sm text-slate-600">Assigned Office</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {kpiData?.officeName ? '1' : '0'}
                      </p>
                    </div>
                  )}
                {kpiData?.fyActiveKPI?.Attributes &&
                  kpiData.fyActiveKPI.Attributes.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-600">Attributes</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {kpiData.fyActiveKPI.Attributes.length}
                      </p>
                    </div>
                  )}
                {kpiData?.fyActiveKPI?.SDGs &&
                  kpiData.fyActiveKPI.SDGs.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-600">SDG Links</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {kpiData.fyActiveKPI.SDGs.length}
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {/* Measurements Card */}
            {kpiData?.fyActiveKPI?.FYActiveKPIMeasurements &&
              kpiData.fyActiveKPI.FYActiveKPIMeasurements.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-purple-600" />
                    Measurements
                  </h3>
                  <div className="space-y-6">
                    {kpiData.fyActiveKPI.FYActiveKPIMeasurements.map(
                      (measurement: FYActiveKPIMeasurement, idx: number) => (
                        <div
                          key={measurement.id || idx}
                          className="border-l-2 border-purple-300 pl-4 pb-4 border-b last:border-b-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">
                                {measurement.name ||
                                  `Measurement ${measurement.id || idx + 1}`}
                              </p>
                              {measurement.id && !measurement.name && (
                                <p className="text-xs text-slate-500 mt-1">
                                  ID: {measurement.id}
                                </p>
                              )}
                            </div>
                          </div>
                          {measurement.statement && (
                            <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded">
                              {measurement.statement}
                            </p>
                          )}
                          {measurement.dimension &&
                            measurement.dimension.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium text-slate-600 mb-1">
                                  Dimensions:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {measurement.dimension.map(
                                    (dim: string, i: number) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="text-xs bg-purple-50"
                                      >
                                        {dim}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          {measurement.moVs && measurement.moVs.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-slate-600 mb-2">
                                Means of Verification:
                              </p>
                              <div className="space-y-1">
                                {measurement.moVs.map(
                                  (mov: string, i: number) => (
                                    <p
                                      key={i}
                                      className="text-xs text-slate-700 bg-slate-50 p-2 rounded"
                                    >
                                      {mov}
                                    </p>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Attributes Card */}
            {kpiData?.fyActiveKPI?.Attributes &&
              kpiData.fyActiveKPI.Attributes.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Attributes
                  </h3>
                  <div className="space-y-3">
                    {kpiData.fyActiveKPI.Attributes.map(
                      (attr: Attribute, idx: number) => (
                        <div
                          key={attr.id || idx}
                          className="pb-3 border-b last:border-b-0 last:pb-0 bg-slate-50 p-3 rounded"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">
                                {attr.name || `Attribute ${attr.id || idx + 1}`}
                              </p>
                              {attr.code && (
                                <p className="text-xs text-slate-600 mt-1">
                                  Code: {attr.code}
                                </p>
                              )}
                              {!attr.name && attr.id && (
                                <p className="text-xs text-slate-500 mt-1">
                                  ID: {attr.id}
                                </p>
                              )}
                            </div>
                          </div>
                          {attr.description && (
                            <p className="text-xs text-slate-700 mt-2 bg-white p-2 rounded">
                              {attr.description}
                            </p>
                          )}
                          {attr.parentAttributeId && (
                            <p className="text-xs text-slate-500 mt-2">
                              Parent ID: {attr.parentAttributeId}
                            </p>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* SDGs Card */}
            {kpiData?.fyActiveKPI?.SDGs &&
              kpiData.fyActiveKPI.SDGs.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Sustainable Development Goals (SDGs)
                  </h3>
                  <div className="space-y-3">
                    {kpiData.fyActiveKPI.SDGs.map((sdg: SDG, idx: number) => (
                      <div
                        key={sdg.id || idx}
                        className="pb-3 border-b last:border-b-0 last:pb-0 bg-blue-50 p-3 rounded"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900">
                                {sdg.name || `SDG ${sdg.id || idx + 1}`}
                              </p>
                              {sdg.sdgCode && (
                                <Badge className="text-xs bg-blue-100 text-blue-800">
                                  {sdg.sdgCode}
                                </Badge>
                              )}
                            </div>
                            {!sdg.name && sdg.id && (
                              <p className="text-xs text-slate-600 mt-1">
                                ID: {sdg.id}
                              </p>
                            )}
                          </div>
                        </div>
                        {sdg.description && (
                          <p className="text-xs text-slate-700 mt-2 bg-white p-2 rounded">
                            {sdg.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Office Assignment Card - Show current office assignment */}
            {source !== 'kpiassignment' && kpiData?.officeName && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Assigned Office
                </h3>
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900 text-lg">
                          {kpiData.officeName}
                        </p>
                        {kpiData?.office?.code && (
                          <p className="text-xs text-slate-600 mt-1">
                            Code: {kpiData.office.code}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={`text-xs ${
                          kpiData?.isLocked
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {kpiData?.isLocked ? 'Locked' : 'Unlocked'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                      <div className="bg-white p-2 rounded">
                        <p className="text-slate-600 font-medium">
                          Annual Target
                        </p>
                        <p className="font-bold text-slate-900 mt-1">
                          {kpiData?.assignedTargetAnnual?.toLocaleString() ||
                            '—'}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-slate-600 font-medium">
                          Q1-Q4 Total
                        </p>
                        <p className="font-bold text-slate-900 mt-1">
                          {(
                            (kpiData?.assignedTargetQ1 || 0) +
                            (kpiData?.assignedTargetQ2 || 0) +
                            (kpiData?.assignedTargetQ3 || 0) +
                            (kpiData?.assignedTargetQ4 || 0)
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {kpiData?.office?.description && (
                      <div className="mt-4 pt-3 border-t border-green-200">
                        <p className="text-xs text-slate-600 font-medium mb-1">
                          Description:
                        </p>
                        <p className="text-xs text-slate-700">
                          {kpiData.office.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
