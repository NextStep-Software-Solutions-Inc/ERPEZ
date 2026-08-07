/**
 * Key Performance Indicator Details Page
 * Displays comprehensive information about a specific indicator
 */

import { useMemo, type ReactNode } from 'react'
import { useParams } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { AlertTriangle, Edit, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageContainerDashtail } from '@/components/v2'
import { pageAnimations } from '@/utils/animation'
import {
  KpiValueBadge,
  getActivityBadge,
  getFunctionCategoryBadge,
  getGadBadge,
  getHierarchyBadge,
  getOptInBadge,
} from '../utils/kpiBadgeUtils'
import {
  getDistributionBehaviorDescription,
  getFrequencyLabel,
  getMeasurementUnitLabel,
  type KpiDetailResponse,
  type KPITarget,
  type MasterKPI,
  type Period,
  QuarterName,
} from '../types'
import { mapKpiDetailResponseToMasterKPI } from '../utils/kpiMapper'
import { mapKpiTargetResponsesToKpiTargets } from '../utils/kpiMapper'
import { useKpiById } from '../handlers/hooks'

interface IMasterKpiDetailsPageProps {
  onEdit?: (kpi: MasterKPI) => void
  onDelete?: (kpiId: string) => void
}

type DetailRowProps = {
  label: string
  value: ReactNode
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm font-medium text-foreground wrap-break-word">
        {value}
      </div>
    </div>
  )
}

const quarterOrder: Record<QuarterName, number> = {
  FirstQuarter: 1,
  SecondQuarter: 2,
  ThirdQuarter: 3,
  FourthQuarter: 4,
}

const isQuarterName = (value: string): value is QuarterName =>
  Object.values(QuarterName).includes(value as QuarterName)

const getQuarterOrder = (quarterName: string | null | undefined): number => {
  if (!quarterName || !isQuarterName(quarterName)) return 0

  return quarterOrder[quarterName as QuarterName]
}

const formatQuarterLabel = (quarterName: QuarterName | null): string => {
  if (!quarterName) return '—'
  return quarterName.replace(/([a-z])([A-Z])/g, '$1 $2')
}

const formatTargetValue = (targetValue: number): string =>
  Number.isInteger(targetValue) ? `${targetValue}` : targetValue.toFixed(1)

const formatPeriodLabel = (period: Period | null): string => period ?? '—'

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return 'Not available'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

const formatCountLabel = (count: number, singular: string): string => {
  if (count === 0) return `No ${singular.toLowerCase()}s`
  if (count === 1) return `1 ${singular}`
  return `${count} ${singular}s`
}

function renderTagChips(items: Array<{ id: string; label: string }>) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">None</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge
          key={item.id}
          variant="outline"
          className="border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700"
        >
          {item.label}
        </Badge>
      ))}
    </div>
  )
}

export function MasterKpiDetailsPage({
  onEdit,
  onDelete,
}: IMasterKpiDetailsPageProps) {
  const { kpiId } = useParams({
    from: '/v2/kpi-library/master-kpi/$kpiId',
  })

  const {
    data: kpiResponse,
    isLoading: isKpiLoading,
    error: kpiError,
  } = useKpiById({
    pathParams: { id: kpiId ?? '' },
    queryParams: {},
    enabled: Boolean(kpiId),
  })

  const detailKpi: KpiDetailResponse | null = kpiResponse?.data ?? null

  const editableKpi = useMemo(
    () => (detailKpi ? mapKpiDetailResponseToMasterKPI(detailKpi) : null),
    [detailKpi],
  )

  const targetRows = useMemo<KPITarget[]>(() => {
    const rows = mapKpiTargetResponsesToKpiTargets(
      detailKpi?.KPITargets ?? [],
      kpiId ?? '',
    )

    return [...rows].sort((left, right) => {
      const leftPeriodOrder = left.period === 'Annually' ? 0 : 1
      const rightPeriodOrder = right.period === 'Annually' ? 0 : 1

      if (leftPeriodOrder !== rightPeriodOrder) {
        return leftPeriodOrder - rightPeriodOrder
      }

      const leftQuarter = getQuarterOrder(left.quarterName)
      const rightQuarter = getQuarterOrder(right.quarterName)

      return leftQuarter - rightQuarter
    })
  }, [detailKpi?.KPITargets, kpiId])

  const isLoading = isKpiLoading

  const actionButtons =
    editableKpi && (onEdit || onDelete) ? (
      <div className="flex flex-wrap gap-2">
        {onEdit && (
          <Button variant="outline" onClick={() => onEdit(editableKpi)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            color="destructive"
            onClick={() => onDelete(editableKpi.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
    ) : undefined

  if (isLoading) {
    return (
      <PageContainerDashtail
        contentType="default"
        mode="simple"
        title="Master KPI Details"
        description="Loading indicator details..."
        backTo={{ to: '/v2/kpi-library', search: { tab: 'master-kpi' } }}
        backLabel="Back to Indicator Library"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/5" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainerDashtail>
    )
  }

  if (kpiError || !detailKpi || !editableKpi) {
    return (
      <PageContainerDashtail
        contentType="default"
        mode="simple"
        title="Master KPI Details"
        description="The selected indicator could not be loaded."
        backTo={{ to: '/v2/kpi-library', search: { tab: 'master-kpi' } }}
        backLabel="Back to Indicator Library"
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-destructive">
            {kpiError instanceof Error
              ? kpiError.message
              : 'Indicator not found.'}
          </AlertDescription>
        </Alert>
      </PageContainerDashtail>
    )
  }

  const complianceTags = (detailKpi.Attributes ?? []).map((attribute) => ({
    id: attribute.id,
    label: attribute.name ?? attribute.code ?? attribute.id,
  }))

  const developmentGoals = (detailKpi.SDGs ?? []).map((goal) => ({
    id: goal.id,
    label: goal.name ?? goal.id,
  }))

  const measurements = detailKpi.KPIMeasurements ?? []
  const parentKpi = detailKpi.ParentKPI

  return (
    <PageContainerDashtail
      contentType="default"
      mode="simple"
      title={detailKpi.code ?? 'Master KPI'}
      description={detailKpi.name ?? ''}
      backTo={{ to: '/v2/kpi-library', search: { tab: 'master-kpi' } }}
      backLabel="Back to Indicator Library"
      actions={actionButtons}
    >
      <motion.div
        variants={pageAnimations.pageEnter}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] p-4 lg:p-6">
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>
                Core definition and measurement details for this indicator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Operational Definition
                </p>
                <p className="text-sm leading-6 text-foreground">
                  {detailKpi.description || 'Not specified'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow
                  label="Frequency of Monitoring"
                  value={getFrequencyLabel(editableKpi.monitoringFrequency)}
                />
                <DetailRow
                  label="Measurement Unit"
                  value={getMeasurementUnitLabel(editableKpi.measurementUnit)}
                />
                <DetailRow
                  label="Distribution Behavior"
                  value={detailKpi.distributionBehavior || 'Not set'}
                />
                <DetailRow
                  label="Status"
                  value={
                    <KpiValueBadge
                      {...getActivityBadge(editableKpi.isActive)}
                    />
                  }
                />
                <DetailRow
                  label="Gender & Development"
                  value={<KpiValueBadge {...getGadBadge(detailKpi.isGAD)} />}
                />
                <DetailRow
                  label="Opt-In Availability"
                  value={
                    <KpiValueBadge
                      {...getOptInBadge(detailKpi.isOptInAvailable)}
                    />
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow
                  label="Parent Indicator"
                  value={
                    parentKpi
                      ? `${parentKpi.code ?? 'N/A'} - ${parentKpi.name ?? 'Unknown'}`
                      : 'Top-level KPI'
                  }
                />
                <DetailRow
                  label="Created At"
                  value={formatDateTime(detailKpi.createdAt)}
                />
                <DetailRow
                  label="Created By"
                  value={detailKpi.createdBy || 'Not available'}
                />
                <DetailRow
                  label="Linked MFOPAP"
                  value={
                    detailKpi.mfopapId || detailKpi.MFOPAP?.id || 'Not linked'
                  }
                />
              </div>

              {detailKpi.distributionBehavior && (
                <Alert variant="soft" color="info">
                  <AlertDescription>
                    {getDistributionBehaviorDescription(
                      editableKpi.targetDistributionBehavior,
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Linked MFOPAP</CardTitle>
              <CardDescription>
                Program or project context attached to this indicator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {detailKpi.MFOPAP ? (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-sm font-medium">
                      {detailKpi.MFOPAP.name ?? 'Not available'}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailRow
                      label="Code"
                      value={detailKpi.MFOPAP.code ?? 'Not available'}
                    />
                    <DetailRow
                      label="Type"
                      value={detailKpi.MFOPAP.type ?? 'Not available'}
                    />
                    <DetailRow
                      label="Active"
                      value={detailKpi.MFOPAP.isActive ? 'Yes' : 'No'}
                    />
                    <DetailRow label="MFOPAP ID" value={detailKpi.MFOPAP.id} />
                  </div>
                  <Alert variant="soft" color="info">
                    <AlertDescription>
                      This KPI is linked to <b>{detailKpi.MFOPAP.name}</b>,
                      which provides the program context shown in the API
                      payload.
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                  No MFOPAP is linked to this KPI.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 px-4 lg:px-6">
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Classification & Tags</CardTitle>
              <CardDescription>
                Functional grouping and reporting tags attached to this KPI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Function Category
                </p>
                <KpiValueBadge
                  {...getFunctionCategoryBadge(editableKpi.functionCategory)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Hierarchy</p>
                <KpiValueBadge
                  {...getHierarchyBadge(
                    detailKpi.parentKPIId,
                    detailKpi.ParentKPI?.code,
                  )}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Compliance Tags</p>
                {renderTagChips(complianceTags)}
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Raw Attributes Count
                </p>
                <p className="text-sm text-foreground">
                  {formatCountLabel(complianceTags.length, 'attribute')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">KPI Measurements</CardTitle>
              <CardDescription>
                Measurement dimensions and verification sources from the API
                payload.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {measurements.length > 0 ? (
                measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className="space-y-4 rounded-xl border border-border bg-muted/20 p-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailRow
                        label="Dimension"
                        value={measurement.dimension || 'Not specified'}
                      />
                      <DetailRow
                        label="Editable"
                        value={
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className="border-emerald-200 bg-emerald-50 text-emerald-700"
                            >
                              MOV{' '}
                              {measurement.isMOVEditable
                                ? 'Editable'
                                : 'Locked'}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-sky-200 bg-sky-50 text-sky-700"
                            >
                              Scale{' '}
                              {measurement.isScaleEditable
                                ? 'Editable'
                                : 'Locked'}
                            </Badge>
                          </div>
                        }
                      />
                      <DetailRow
                        label="Rating Scale Template"
                        value={measurement.ratingScaleTemplateId}
                      />
                      <DetailRow
                        label="Created At"
                        value={formatDateTime(measurement.createdAt)}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Means of Verification
                      </p>
                      {measurement.moVs && measurement.moVs.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {measurement.moVs.map((mov) => (
                            <Badge
                              key={mov}
                              variant="outline"
                              className="border-slate-200 bg-slate-50 text-slate-700"
                            >
                              {mov}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No MOVs listed.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                  No KPI measurements are configured for this indicator yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 px-4 lg:px-6">
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Development Goals</CardTitle>
              <CardDescription>
                SDG alignment and development priority tags.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {renderTagChips(developmentGoals)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Audit Metadata</CardTitle>
              <CardDescription>
                High-value metadata returned by the API for traceability.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="Record ID" value={detailKpi.id} />
              <DetailRow
                label="Created At"
                value={formatDateTime(detailKpi.createdAt)}
              />
              <DetailRow
                label="Created By"
                value={detailKpi.createdBy || 'Not available'}
              />
              <DetailRow
                label="Targets"
                value={formatCountLabel(targetRows.length, 'target')}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm mx-4 lg:mx-6 mb-6">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">KPI Targets</CardTitle>
            <CardDescription>
              Target values currently configured for this indicator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {targetRows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-3 text-left font-semibold">
                        Period
                      </th>
                      <th className="px-3 py-3 text-left font-semibold">
                        Quarter
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Target Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {targetRows.map((target: KPITarget) => (
                      <tr key={target.id} className="border-b last:border-0">
                        <td className="px-3 py-3 text-foreground">
                          {formatPeriodLabel(target.period)}
                        </td>
                        <td className="px-3 py-3 text-foreground">
                          {formatQuarterLabel(target.quarterName ?? null)}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-foreground">
                          {formatTargetValue(target.targetValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                No KPI targets are configured for this indicator yet.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageContainerDashtail>
  )
}
