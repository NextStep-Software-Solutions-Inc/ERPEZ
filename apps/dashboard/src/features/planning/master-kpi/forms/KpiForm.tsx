/**
 * Master KPI Unified Form Component
 * Uses @tanstack/react-form + Zod validation per SPMS pattern
 */
import { useForm, useStore } from '@tanstack/react-form'
import { useEffect, useMemo, useState } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { ComplianceTagSelect } from '../components/ComplianceTagSelect'
import { DevelopmentGoalSelect } from '../components/DevelopmentGoalSelect'
import { DistributionBehaviorSelect } from '../components/DistributionBehaviorSelect'
import { FrequencyOfMonitoringSelect } from '../components/FrequencyOfMonitoringSelect'
import { MeasurementUnitSelect } from '../components/MeasurementUnitSelect'
import {
  MonitoringFrequency,
  FunctionCategory,
  MeasurementUnit,
} from '../types'
import { createKpiSchemaWithRefinement } from './kpi.schema'
import type { KpiFormValues } from './kpi.schema'
import type { MfoPap } from '@/components/features/planning/mfopap/types'
import type { KpiAttributeOption, KpiSdgOption, MasterKPI } from '../types'
import { getMfoPapsRequest } from '@/components/features/planning/attribute/handlers/getMfoPapsRequest'
import FieldInfo from '@/components/FieldInfo'
import { Checkbox } from '@/components/ui/checkbox'
import { LabelWithInfo } from '@/components/LabelWithInfo'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface KpiFormProps {
  formId: string
  onSubmit: (data: KpiFormValues) => void
  onValidationSummaryChange?: (errors: Array<string>) => void
  initialValues?: Partial<KpiFormValues>
  isLoading?: boolean
  isOpen?: boolean
  availableKpis?: Array<MasterKPI>
  availableSdgs?: Array<KpiSdgOption>
  availableAttributes?: Array<KpiAttributeOption>
  mode: 'create' | 'edit'
  currentKpiId?: string
}

const useMfoPaps = createQueryHookFromTemplate(getMfoPapsRequest)

const fieldLabels: Record<string, string> = {
  code: 'Indicator Code',
  name: 'Indicator Name',
  operationalDefinition: 'Operational Definition',
  functionCategory: 'Function Category',
  mfopapId: 'Major Final Output',
  parentKPIId: 'Parent Indicator',
  measurementUnit: 'Measurement Unit',
  monitoringFrequency: 'Frequency of Monitoring',
  targetDistributionBehavior: 'Target Distribution Behavior',
  developmentGoals: 'Development Goals',
  complianceTags: 'Compliance Tags',
  isGAD: 'Gender & Development',
  isOptIn: 'Available for Opt-in',
}

const getErrorMessage = (error: unknown): string | null => {
  if (typeof error === 'string') return error

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }

  return null
}

const collectFieldErrors = (fieldMeta: unknown): Array<string> => {
  if (!fieldMeta || typeof fieldMeta !== 'object') return []

  return Object.entries(
    fieldMeta as Record<string, { errors?: Array<unknown> }>,
  ).flatMap(([fieldName, meta]) => {
    const errors = meta.errors ?? []
    const messages = errors
      .map(getErrorMessage)
      .filter((message): message is string => Boolean(message))

    if (!messages.length) return []

    const uniqueMessages = Array.from(new Set(messages))
    const label = fieldLabels[fieldName] ?? fieldName

    return [`${label}: ${uniqueMessages.join(', ')}`]
  })
}

export function KpiForm({
  formId,
  onSubmit,
  onValidationSummaryChange,
  initialValues,
  isLoading = false,
  isOpen = true,
  availableKpis = [],
  availableSdgs = [],
  availableAttributes = [],
  currentKpiId,
}: KpiFormProps) {
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const { data: mfoPaps } = useMfoPaps({
    pathParams: {},
    queryParams: { pageSize: 1000, pageNumber: 1 },
    enabled: isOpen,
  })

  const form = useForm({
    defaultValues: {
      code: initialValues?.code || '',
      name: initialValues?.name || '',
      operationalDefinition: initialValues?.operationalDefinition || '',
      monitoringFrequency:
        initialValues?.monitoringFrequency || MonitoringFrequency.QUARTERLY,
      measurementUnit: initialValues?.measurementUnit || MeasurementUnit.NUMBER,
      isGAD: initialValues?.isGAD ?? false,
      parentKPIId: initialValues?.parentKPIId || null,
      mfopapId: initialValues?.mfopapId || null,
      functionCategory:
        initialValues?.functionCategory || FunctionCategory.CORE,
      complianceTags: initialValues?.complianceTags || [],
      developmentGoals: initialValues?.developmentGoals || [],
      targetDistributionBehavior:
        initialValues?.targetDistributionBehavior || null,
      isOptIn: initialValues?.isOptIn ?? false,
    } satisfies KpiFormValues,
    validators: {
      onChange: createKpiSchemaWithRefinement(availableKpis, currentKpiId),
    },
    onSubmit: ({ value }) => {
      onSubmit(value)
    },
  })

  const fieldMeta = useStore(form.store, (state) => state.fieldMeta)
  const validationErrors = useMemo(
    () => collectFieldErrors(fieldMeta),
    [fieldMeta],
  )

  useEffect(() => {
    onValidationSummaryChange?.(submitAttempted ? validationErrors : [])
  }, [onValidationSummaryChange, submitAttempted, validationErrors])

  useEffect(() => {
    if (!isOpen) {
      setSubmitAttempted(false)
      onValidationSummaryChange?.([])
    }
  }, [isOpen, onValidationSummaryChange])

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setSubmitAttempted(true)
        form.handleSubmit()
      }}
      className="space-y-10 px-1"
    >
      {/* 1. Basic Information (Define the KPI) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <h3 className="text-lg font-semibold text-foreground">
            Basic Details
          </h3>
        </div>
        <Separator className="bg-primary/20" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Code Field */}
          <form.Field
            name="code"
            children={(field) => (
              <div className="space-y-1">
                <LabelWithInfo
                  label="Indicator Code"
                  required
                  tooltip="A unique identifier for the indicator (e.g., D-1)"
                />
                <Input
                  id={field.name}
                  placeholder="e.g., D-1"
                  variant="bordered"
                  disabled={isLoading}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )}
          />

          {/* Name Field */}
          <form.Field
            name="name"
            children={(field) => (
              <div className="space-y-1">
                <LabelWithInfo
                  label="Indicator Name"
                  required
                  tooltip="The formal name of the indicator (e.g., Number of Trainees)"
                  side="left"
                />
                <Input
                  id={field.name}
                  placeholder="e.g., Number of Trainees"
                  variant="bordered"
                  disabled={isLoading}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )}
          />

          {/* Operational Definition */}
          <div className="md:col-span-2">
            <form.Field
              name="operationalDefinition"
              children={(field) => (
                <div className="space-y-1">
                  <LabelWithInfo
                    label="Operational Definition"
                    required
                    tooltip="Provide a clear, concise definition of what this KPI measures and how results are determined."
                  />
                  <textarea
                    id={field.name}
                    placeholder="Define what this KPI measures..."
                    disabled={isLoading}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} showErrors={submitAttempted} />
                </div>
              )}
            />
          </div>

          {/* Function Category */}
          <form.Field
            name="functionCategory"
            children={(field) => (
              <div className="space-y-1">
                <LabelWithInfo
                  label="Function Category"
                  required
                  tooltip="Classify the KPI based on its role: Core (Primary), Support (Administrative), or Strategic (Long-term)."
                />
                <Select
                  value={field.state.value}
                  onValueChange={(val) =>
                    field.handleChange(val as FunctionCategory)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(FunctionCategory).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )}
          />

          {/* Major Final Output Selection (Optional) */}
          <form.Field
            name="mfopapId"
            children={(field) => (
              <div className="space-y-1">
                <LabelWithInfo
                  label="Major Final Output (Optional)"
                  tooltip="Link this indicator to a specific Major Final Output or Program/Activity/Project."
                  side="left"
                />

                <Select
                  value={field.state.value || 'none'}
                  onValueChange={(val) =>
                    field.handleChange(val === 'none' ? null : val)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select output" />
                  </SelectTrigger>
                  <SelectContent>
                    {mfoPaps?.data.map((mfoPap: MfoPap) => (
                      <SelectItem key={mfoPap.id} value={mfoPap.id}>
                        {mfoPap.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )}
          />

          {/* Parent Indicator (Optional) */}
          <form.Field
            name="parentKPIId"
            children={(field) => (
              <div className="space-y-1">
                <LabelWithInfo
                  label="Parent Indicator (Optional)"
                  tooltip="Link this to a higher-level indicator to establish an organizational hierarchy."
                />
                <Select
                  value={field.state.value || 'none'}
                  onValueChange={(val) =>
                    field.handleChange(val === 'none' ? null : val)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent indicator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {availableKpis
                      .filter((kpi) => !kpi.isArchived)
                      .map((kpi) => (
                        <SelectItem key={kpi.id} value={kpi.id}>
                          {kpi.code} - {kpi.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )}
          />
        </div>
      </div>

      {/* 2. Measurement & Alignment */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <h3 className="text-lg font-semibold text-foreground">
            Measurement & Alignment
          </h3>
        </div>
        <Separator className="bg-primary/20" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Measurement Unit */}
          <form.Field
            name="measurementUnit"
            children={(field) => (
              <div className="space-y-1">
                <LabelWithInfo
                  label="Measurement Unit"
                  required
                  tooltip="The unit of measure used for reporting (e.g., Number, Percentage, Amount)."
                />
                <MeasurementUnitSelect
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={isLoading}
                />
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )}
          />

          {/* Frequency of Monitoring */}
          <form.Field
            name="monitoringFrequency"
            children={(field) => (
              <div className="space-y-1">
                <LabelWithInfo
                  label="Frequency of Monitoring"
                  required
                  tooltip="How often progress for this KPI will be updated and reviewed."
                  side="left"
                />
                <FrequencyOfMonitoringSelect
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={isLoading}
                />
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )}
          />

          {/* Target Distribution Behavior */}
          <div className="md:col-span-2">
            <form.Field
              name="targetDistributionBehavior"
              children={(field) => (
                <div className="space-y-1">
                  <LabelWithInfo
                    label="Target Distribution Behavior"
                    tooltip="Controls how quarterly targets relate to the annual target: Summation (sum of quarters = annual), Uniform (each quarter = annual), Milestone (pass/fail markers), Maximum (ceiling cap), or Minimum (floor threshold)."
                  />
                  <DistributionBehaviorSelect
                    value={field.state.value ?? null}
                    onChange={field.handleChange}
                    disabled={isLoading}
                    showDescription={true}
                  />
                  <FieldInfo field={field} showErrors={submitAttempted} />
                </div>
              )}
            />
          </div>

          {/* Measurement Scaling (API Bridge) */}
          <div className="md:col-span-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center transition-all hover:bg-primary/10">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-semibold text-lg tracking-tight">
                  Define Performance Measurement Scale
                </h4>
                <p className="mx-auto max-w-[440px] text-sm text-muted-foreground leading-relaxed">
                  Establish the qualitative and quantitative criteria for this
                  indicator. Once defined, it will be available for planning and
                  monitoring across all linked units.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-background font-medium"
                  onClick={() => {
                    const url = `/v2/kpi-library?tab=kpi-measurement-configurator&kpi=${encodeURIComponent(
                      currentKpiId || 'new',
                    )}`
                    window.open(url, '_blank')
                  }}
                >
                  Configure Definition
                </Button>
                <div className="h-4 w-px bg-border" />
                <Badge
                  variant="soft"
                  color="info"
                  className="bg-primary/10 text-primary"
                >
                  API Gap Resolved
                </Badge>
              </div>
            </div>
          </div>

          {/* Strategic Alignment Fields */}
          <div className="md:col-span-2 space-y-6">
            <form.Field
              name="developmentGoals"
              children={(field) => (
                <div className="space-y-1">
                  <LabelWithInfo
                    label="Development Goals (Sustainable Development Goals & Philippine Development Plan)"
                    tooltip="Align this indicator with Sustainable Development Goals or Philippine Development Plan targets."
                  />
                  <DevelopmentGoalSelect
                    value={field.state.value}
                    onChange={field.handleChange}
                    options={availableSdgs}
                    disabled={isLoading}
                  />
                  <FieldInfo field={field} showErrors={submitAttempted} />
                </div>
              )}
            />

            <form.Field
              name="complianceTags"
              children={(field) => (
                <div className="space-y-1">
                  <LabelWithInfo
                    label="Compliance Tags"
                    tooltip="Tags for regulatory or organizational compliance requirements (e.g., PBB, ISO)."
                  />
                  <ComplianceTagSelect
                    value={field.state.value}
                    onChange={field.handleChange}
                    options={availableAttributes}
                    disabled={isLoading}
                  />
                  <FieldInfo field={field} showErrors={submitAttempted} />
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* 3. Administrative Settings (System Behavior) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <h3 className="text-lg font-semibold text-foreground">
            Administrative Settings
          </h3>
        </div>
        <Separator className="bg-primary/20" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GAD Checkbox */}
          <form.Field
            name="isGAD"
            children={(field) => (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-all shadow-sm">
                <LabelWithInfo
                  label="Gender & Development (GAD)"
                  tooltip="Indicates if this KPI supports gender-responsive planning and monitoring."
                  htmlFor="isGAD-toggle"
                  className="mb-0 cursor-pointer text-sm font-medium text-gray-800"
                />
                <Checkbox
                  id="isGAD-toggle"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                  disabled={isLoading}
                />
              </div>
            )}
          />

          {/* Opt-in Checkbox */}
          <form.Field
            name="isOptIn"
            children={(field) => (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-all shadow-sm">
                <LabelWithInfo
                  label="Available for Opt-in"
                  tooltip="Allows other offices to select and adopt this KPI for their own performance monitoring."
                  htmlFor="optin-toggle"
                  className="mb-0 cursor-pointer text-sm font-medium text-gray-800"
                />
                <Checkbox
                  id="optin-toggle"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                  disabled={isLoading}
                />
              </div>
            )}
          />
        </div>

      </div>
    </form>
  )
}
