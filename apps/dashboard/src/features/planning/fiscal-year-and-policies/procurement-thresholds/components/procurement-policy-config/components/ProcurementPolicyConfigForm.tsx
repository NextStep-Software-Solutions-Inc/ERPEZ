import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useMemo, useState, useEffect } from 'react'
import { useUpdateFormData } from '../hooks/useUpdateFormData'
import { getProcurementModesRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementModesRequest'
import { getProcurementModeThresholdsRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementModeThresholdsRequest'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import type {
  ProcurementMode,
  ProcurementModeThreshold,
  FiscalYear,
} from '@/lib/fiscal-year-and-policies/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/ui/field'
import SubmitButton from '@/components/SubmitButton'
import { cn } from '@/lib/utils'
import { getModeColor } from '@/lib/fiscal-year-and-policies/utils/getModeColor'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { FormSection } from './FormSection'
import { AmountRangeProgress } from './AmountRangeProgress'
import { Loader2 } from 'lucide-react'
import { FieldValidationIndicator } from './FieldValidationIndicator'

const useProcurementModes = createQueryHookFromTemplate(
  getProcurementModesRequest,
)
const useProcurementModeThresholds = createQueryHookFromTemplate(
  getProcurementModeThresholdsRequest,
)
const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)

// Base schema for per-field onChange validation (no refine — refine produces ZodEffects)
const procurementPolicyConfigBaseSchema = z.object({
  fiscalYearId: z.string().min(1, 'Fiscal year is required'),
  procurementModeId: z.string().min(1, 'Procurement mode is required'),
  procurementModeThresholdId: z.string().min(1, 'Threshold is required'),
  minAmount: z.number().min(0, 'Minimum amount must be ≥ 0'),
  maxAmount: z.union([
    z.number().min(0, 'Maximum amount must be ≥ 0'),
    z.undefined(),
  ]),
})

// Full schema with cross-field validation (used for type-inference only)
export const procurementPolicyConfigFormSchema =
  procurementPolicyConfigBaseSchema.refine(
    (data) => !data.maxAmount || data.maxAmount >= data.minAmount,
    {
      message: 'Maximum amount must be ≥ minimum amount',
      path: ['maxAmount'],
    },
  )

export type ProcurementPolicyConfigFormValues = z.infer<
  typeof procurementPolicyConfigFormSchema
>

interface ProcurementPolicyConfigFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ProcurementPolicyConfigFormValues) => void
  isSubmitting?: boolean
  /** Pre-fill the fiscal year field when a FY is already selected in the parent */
  defaultFiscalYearId?: string
}

export function ProcurementPolicyConfigForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  defaultFiscalYearId,
}: ProcurementPolicyConfigFormProps) {
  const { updateFormData, clearFormData } = useUpdateFormData()

  // Local state to drive the live amount range preview & mode badge
  const [selectedModeId, setSelectedModeId] = useState(
    defaultFiscalYearId ? '' : '',
  )
  const [selectedThresholdId, setSelectedThresholdId] = useState('')
  const [previewMin, setPreviewMin] = useState(0)
  const [previewMax, setPreviewMax] = useState<number | undefined>(undefined)

  const { data: fiscalYearsData, isLoading: isFYLoading } = useFiscalYears({
    pathParams: {},
    queryParams: { pageSize: 100, pageNumber: 1 },
  })
  const { data: modesData, isLoading: isModesLoading } = useProcurementModes({
    pathParams: {},
    queryParams: { pageSize: 1000, pageNumber: 1 },
  })
  const { data: thresholdsData, isLoading: isThresholdsLoading } =
    useProcurementModeThresholds({
      pathParams: {},
      queryParams: { pageSize: 1000, pageNumber: 1 },
    })

  const fiscalYears = useMemo(
    () => fiscalYearsData?.data || [],
    [fiscalYearsData],
  )
  const modes = useMemo(() => modesData?.data || [], [modesData])
  const thresholds = useMemo(() => thresholdsData?.data || [], [thresholdsData])

  const selectedMode = modes.find(
    (m: ProcurementMode) => m.id === selectedModeId,
  )
  const selectedModeColors = getModeColor(selectedMode?.name)
  const selectedThreshold = thresholds.find(
    (t: ProcurementModeThreshold) => t.id === selectedThresholdId,
  )

  // Filter thresholds to selected mode when applicable
  const relevantThresholds = useMemo(
    () =>
      selectedModeId
        ? thresholds.filter(
            (t: ProcurementModeThreshold) =>
              t.procurementModeId === selectedModeId,
          )
        : thresholds,
    [thresholds, selectedModeId],
  )

  const form = useForm({
    defaultValues: {
      fiscalYearId: defaultFiscalYearId ?? '',
      procurementModeId: '',
      procurementModeThresholdId: '',
      minAmount: 0,
      maxAmount: undefined as number | undefined,
    },
    validators: {
      onChange: procurementPolicyConfigBaseSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value as ProcurementPolicyConfigFormValues)
      clearFormData()
    },
  })

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
    setSelectedModeId('')
    setSelectedThresholdId('')
    setPreviewMin(0)
    setPreviewMax(undefined)
    clearFormData()
  }

  // Sync slider changes to form fields
  useEffect(() => {
    form.setFieldValue('minAmount', previewMin)
  }, [previewMin])

  useEffect(() => {
    form.setFieldValue('maxAmount', previewMax)
  }, [previewMax])

  return (
    <ResponsiveDialogDashtail
      open={open}
      size="5xl"
      title="Create Procurement Policy Config"
      onOpenChange={onOpenChange}
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <SubmitButton
            type="submit"
            form="procurement-policy-config-form"
            disabled={
              isSubmitting ||
              !form.state.isValid ||
              !form.state.canSubmit ||
              !selectedThreshold
            }
            loading={isSubmitting}
            title={
              !selectedThreshold ? 'Please select a threshold first' : undefined
            }
          >
            Create Config
          </SubmitButton>
        </div>
      }
    >
      <form
        id="procurement-policy-config-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        {/* ── Section 1: Mode & Threshold ─────────────────────────── */}
        <FormSection
          title="Procurement Mode & Threshold"
          description="Select which procurement method applies and the regulatory threshold range."
          withDivider
        >
          {/* Fiscal Year */}
          <form.Field name="fiscalYearId">
            {(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fiscalYearId">
                    Fiscal Year <span className="text-destructive">*</span>
                  </Label>
                  <FieldValidationIndicator
                    isValid={
                      (field.state.value as string)?.length > 0 &&
                      field.state.meta.errors.length === 0
                    }
                    isError={field.state.meta.errors.length > 0}
                    isLoading={isFYLoading}
                  />
                </div>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value)
                    if (open) updateFormData('fiscalYearId', value)
                  }}
                  disabled={isFYLoading || isSubmitting}
                >
                  <SelectTrigger
                    id="fiscalYearId"
                    className={cn(
                      'transition-all',
                      isFYLoading && 'opacity-60',
                      field.state.meta.errors.length > 0 &&
                        'border-destructive focus:ring-destructive',
                    )}
                  >
                    <SelectValue placeholder="Select fiscal year" />
                  </SelectTrigger>
                  <SelectContent>
                    {isFYLoading ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </div>
                    ) : fiscalYears.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        No fiscal years available
                      </div>
                    ) : (
                      fiscalYears.map((fy: FiscalYear) => (
                        <SelectItem key={fy.id} value={fy.id}>
                          FY {fy.year}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          {/* Procurement Mode */}
          <form.Field name="procurementModeId">
            {(field) => (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="procurementModeId">
                    Procurement Mode <span className="text-destructive">*</span>
                  </Label>
                  <FieldValidationIndicator
                    isValid={
                      (field.state.value as string)?.length > 0 &&
                      field.state.meta.errors.length === 0
                    }
                    isError={field.state.meta.errors.length > 0}
                    isLoading={isModesLoading}
                  />
                </div>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value)
                    setSelectedModeId(value)
                    // Reset threshold when mode changes
                    form.setFieldValue('procurementModeThresholdId', '')
                    setSelectedThresholdId('')
                    if (open) updateFormData('procurementModeId', value)
                  }}
                  disabled={isModesLoading || isSubmitting}
                >
                  <SelectTrigger
                    id="procurementModeId"
                    className={cn(
                      'transition-all',
                      isModesLoading && 'opacity-60',
                      field.state.meta.errors.length > 0 &&
                        'border-destructive focus:ring-destructive',
                    )}
                  >
                    <SelectValue placeholder="Select procurement mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {isModesLoading ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </div>
                    ) : modes.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        No modes available
                      </div>
                    ) : (
                      modes.map((mode: ProcurementMode) => {
                        const colors = getModeColor(mode.name)
                        const modeThresholds = thresholds.filter(
                          (t: ProcurementModeThreshold) =>
                            t.procurementModeId === mode.id,
                        )
                        const hasThresholdRange = modeThresholds.some(
                          (t) =>
                            t.maxThreshold !== null &&
                            t.maxThreshold !== undefined,
                        )
                        return (
                          <SelectItem key={mode.id} value={mode.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'h-2 w-2 rounded-full shrink-0',
                                  colors.dot,
                                )}
                              />
                              {mode.name}
                              {hasThresholdRange && (
                                <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  Limited Range
                                </span>
                              )}
                            </span>
                          </SelectItem>
                        )
                      })
                    )}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          {/* Threshold */}
          <form.Field name="procurementModeThresholdId">
            {(field) => (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="procurementModeThresholdId">
                    Threshold <span className="text-destructive">*</span>
                  </Label>
                  <FieldValidationIndicator
                    isValid={
                      (field.state.value as string)?.length > 0 &&
                      field.state.meta.errors.length === 0
                    }
                    isError={field.state.meta.errors.length > 0}
                    isLoading={isThresholdsLoading}
                  />
                </div>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value)
                    setSelectedThresholdId(value)
                    if (open)
                      updateFormData('procurementModeThresholdId', value)
                  }}
                  disabled={
                    isThresholdsLoading || isSubmitting || !selectedModeId
                  }
                >
                  <SelectTrigger
                    id="procurementModeThresholdId"
                    className={cn(
                      'transition-all',
                      !selectedModeId && 'opacity-60',
                      isThresholdsLoading && 'opacity-60',
                      field.state.meta.errors.length > 0 &&
                        'border-destructive focus:ring-destructive',
                    )}
                  >
                    <SelectValue
                      placeholder={
                        !selectedModeId
                          ? 'Select a mode first'
                          : 'Select threshold range'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isThresholdsLoading && selectedModeId ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </div>
                    ) : !selectedModeId ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        Select a procurement mode first
                      </div>
                    ) : relevantThresholds.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        No thresholds available for this mode
                      </div>
                    ) : (
                      relevantThresholds.map(
                        (threshold: ProcurementModeThreshold) => (
                          <SelectItem key={threshold.id} value={threshold.id}>
                            ₱{threshold.minThreshold.toLocaleString('en-PH')} —{' '}
                            {threshold.maxThreshold
                              ? `₱${threshold.maxThreshold.toLocaleString('en-PH')}`
                              : 'No limit'}
                          </SelectItem>
                        ),
                      )
                    )}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </FormSection>
        {/* ── Section 2: Amount Configuration ─────────────────────── */}
        <FormSection title="Amount Configuration">
          {/* Interactive Amount Range Preview with Slider */}
          {selectedThreshold && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3 mb-4">
              <AmountRangeProgress
                minAmount={previewMin}
                maxAmount={previewMax}
                thresholdMin={selectedThreshold.minThreshold}
                thresholdMax={selectedThreshold.maxThreshold}
                interactive={true}
                onMinChange={setPreviewMin}
                onMaxChange={setPreviewMax}
                showThresholdContext={true}
                barColorClass={cn(selectedModeColors?.bar)}
              />
              {/* Min & Max Amount - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                <form.Field
                  name="minAmount"
                  validators={{
                    onChange: ({ value }) => {
                      // Check if minAmount is below threshold minimum
                      if (
                        selectedThreshold &&
                        value < selectedThreshold.minThreshold
                      ) {
                        return {
                          message: `Minimum amount must be ≥ ₱${selectedThreshold.minThreshold.toLocaleString('en-PH')}`,
                        }
                      }

                      // Check if minAmount exceeds threshold maximum (when threshold has one)
                      if (
                        selectedThreshold?.maxThreshold &&
                        value > selectedThreshold.maxThreshold
                      ) {
                        return {
                          message: `Minimum amount cannot exceed threshold limit of ₱${selectedThreshold.maxThreshold.toLocaleString('en-PH')}`,
                        }
                      }

                      return undefined
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="minAmount">
                        Min <span className="text-destructive">*</span>
                        <span className="text-muted-foreground text-xs font-normal">
                          {' '}
                          {selectedThreshold?.minThreshold
                            ? `(Threshold: ₱${selectedThreshold.minThreshold.toLocaleString('en-PH')})`
                            : ''}
                        </span>
                      </Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                          ₱
                        </span>
                        <Input
                          id="minAmount"
                          type="number"
                          placeholder="0.00"
                          value={field.state.value}
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseFloat(e.target.value)
                              : 0
                            field.handleChange(value)
                            setPreviewMin(value)
                            if (open) updateFormData('minAmount', value)
                          }}
                          disabled={isSubmitting}
                          step="0.01"
                          min="0"
                          className={cn(
                            'pl-7 transition-all',
                            field.state.meta.errors.length > 0 &&
                              'border-destructive focus:ring-destructive',
                          )}
                        />
                      </div>
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>

                {/* Max Amount */}
                <form.Field
                  name="maxAmount"
                  validators={{
                    onChange: ({ value, fieldApi }) => {
                      const min = fieldApi.form.getFieldValue(
                        'minAmount',
                      ) as number

                      // Check if maxAmount is less than minAmount
                      if (value !== undefined && value < min) {
                        return {
                          message: 'Maximum amount must be ≥ minimum amount',
                        }
                      }

                      // Check if maxAmount exceeds threshold max (when threshold has one)
                      if (
                        selectedThreshold?.maxThreshold &&
                        value !== undefined &&
                        value > selectedThreshold.maxThreshold
                      ) {
                        return {
                          message: `Maximum amount cannot exceed threshold limit of ₱${selectedThreshold.maxThreshold.toLocaleString('en-PH')}`,
                        }
                      }

                      return undefined
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="maxAmount">
                        Max{' '}
                        <span className="text-muted-foreground text-xs font-normal">
                          {selectedThreshold?.maxThreshold
                            ? `(Threshold: ₱${selectedThreshold.maxThreshold.toLocaleString('en-PH')})`
                            : ''}
                        </span>
                      </Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                          ₱
                        </span>
                        <Input
                          id="maxAmount"
                          type="number"
                          placeholder="No limit"
                          value={field.state.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                            field.handleChange(value as any)
                            setPreviewMax(value)
                            if (open) updateFormData('maxAmount', value)
                          }}
                          disabled={isSubmitting}
                          step="0.01"
                          min="0"
                          className={cn(
                            'pl-7 transition-all',
                            field.state.meta.errors.length > 0 &&
                              'border-destructive focus:ring-destructive',
                          )}
                        />
                      </div>
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>
          )}
        </FormSection>
      </form>
    </ResponsiveDialogDashtail>
  )
}
