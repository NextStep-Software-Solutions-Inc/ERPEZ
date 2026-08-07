import { useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
// import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getProcurementModesRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementModesRequest'
import { getProcurementModeThresholdsRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementModeThresholdsRequest'
import { createProcurementPolicyConfigRequest } from '@/lib/fiscal-year-and-policies/requests/createProcurementPolicyConfigRequest'
import { updateProcurementPolicyConfigRequest } from '@/lib/fiscal-year-and-policies/requests/updateProcurementPolicyConfigRequest'
import type {
  ProcurementPolicyConfig,
  ProcurementMode,
  ProcurementModeThreshold,
} from '@/lib/fiscal-year-and-policies/types'

interface ProcurementPolicyConfigFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config?: ProcurementPolicyConfig
  fiscalYearId: string
}

// Zod Schema
const procurementPolicyConfigSchema = z
  .object({
    procurementModeId: z.string().min(1, 'Procurement mode is required'),
    procurementModeThresholdId: z.string().min(1, 'Threshold is required'),
    minAmount: z
      .number()
      .min(0, 'Minimum amount must be greater than or equal to 0'),
    maxAmount: z
      .number()
      .min(0, 'Maximum amount must be greater than or equal to 0')
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.maxAmount !== null && data.maxAmount !== undefined) {
        return data.minAmount <= data.maxAmount
      }
      return true
    },
    {
      message: 'Minimum amount must be less than or equal to maximum amount',
      path: ['minAmount'],
    },
  )

const useProcurementModes = createQueryHookFromTemplate(
  getProcurementModesRequest,
)
const useProcurementModeThresholds = createQueryHookFromTemplate(
  getProcurementModeThresholdsRequest,
)
const useCreateProcurementPolicyConfig = createMutationHookFromTemplate(
  createProcurementPolicyConfigRequest,
)
const useUpdateProcurementPolicyConfig = createMutationHookFromTemplate(
  updateProcurementPolicyConfigRequest,
)

export function ProcurementPolicyConfigForm({
  open,
  onOpenChange,
  config,
  fiscalYearId,
}: ProcurementPolicyConfigFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!config

  // Data fetching
  const { data: modesData } = useProcurementModes({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })
  const { data: thresholdsData } = useProcurementModeThresholds({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  const createMutation = useCreateProcurementPolicyConfig()
  const updateMutation = useUpdateProcurementPolicyConfig()

  const modes = modesData?.data || []
  const thresholds = thresholdsData?.data || []

  // Initialize form
  const form = useForm({
    defaultValues: {
      procurementModeId: config?.procurementModeId || '',
      procurementModeThresholdId: config?.procurementModeThresholdId || '',
      minAmount: config?.minAmount || 0,
      maxAmount: config?.maxAmount ?? null,
    },
    onSubmit: async (values) => {
      if (isEditing) {
        updateMutation.mutate(
          {
            pathParams: { id: config.id },
            payload: {
              procurementModeThresholdId:
                values.value.procurementModeThresholdId !==
                config.procurementModeThresholdId
                  ? values.value.procurementModeThresholdId
                  : undefined,
              minAmount:
                values.value.minAmount !== config.minAmount
                  ? values.value.minAmount
                  : undefined,
              maxAmount:
                values.value.maxAmount !== config.maxAmount
                  ? (values.value.maxAmount ?? undefined)
                  : undefined,
            },
          },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) => {
                  const key = query.queryKey[0]
                  return (
                    typeof key === 'string' &&
                    key.startsWith('/procurement-policy-configs')
                  )
                },
              })
              toast.success('Procurement Policy Config updated successfully')
              handleClose()
            },
            onError: (error: unknown) => {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to update Procurement Policy Config',
              )
            },
          },
        )
      } else {
        createMutation.mutate(
          {
            pathParams: {},
            payload: {
              fiscalYearId,
              procurementModeId: values.value.procurementModeId,
              procurementModeThresholdId:
                values.value.procurementModeThresholdId,
              minAmount: values.value.minAmount,
              maxAmount: values.value.maxAmount ?? undefined,
            },
          },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) => {
                  const key = query.queryKey[0]
                  return (
                    typeof key === 'string' &&
                    key.startsWith('/procurement-policy-configs')
                  )
                },
              })
              toast.success('Procurement Policy Config created successfully')
              handleClose()
            },
            onError: (error: unknown) => {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to create Procurement Policy Config',
              )
            },
          },
        )
      }
    },
    validators: {
      onChange: procurementPolicyConfigSchema,
    },
  })

  // Computed values
  const selectedModeId = form.getFieldValue('procurementModeId')
  const selectedThresholdId = form.getFieldValue('procurementModeThresholdId')
  const minAmount = form.getFieldValue('minAmount')
  const maxAmount = form.getFieldValue('maxAmount')

  const selectedMode = modes.find(
    (m: ProcurementMode) => m.id === selectedModeId,
  )
  const selectedThreshold = thresholds.find(
    (t: ProcurementModeThreshold) => t.id === selectedThresholdId,
  )

  const modeThresholds = useMemo(() => {
    if (!selectedModeId) return []
    return thresholds.filter(
      (t: ProcurementModeThreshold) => t.procurementModeId === selectedModeId,
    )
  }, [thresholds, selectedModeId])

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title={
        isEditing
          ? 'Edit Procurement Policy Config'
          : 'Create Procurement Policy Config'
      }
      description={
        isEditing
          ? 'Update the amounts for this configuration'
          : 'Create a new procurement policy configuration'
      }
      size="md"
      footer={
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-5 p-3"
      >
        {/* Procurement Mode Selection */}
        <form.Field
          name="procurementModeId"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor="procurementModeId">
                Procurement Mode <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value)
                  form.setFieldValue('procurementModeThresholdId', '')
                }}
              >
                <SelectTrigger id="procurementModeId">
                  <SelectValue placeholder="Select a procurement mode" />
                </SelectTrigger>
                <SelectContent>
                  {modes.map((mode: ProcurementMode) => (
                    <SelectItem key={mode.id} value={mode.id}>
                      {mode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors?.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0] instanceof Error
                    ? field.state.meta.errors[0].message
                    : String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        />

        {/* Threshold Selection */}
        {selectedModeId && (
          <form.Field
            name="procurementModeThresholdId"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor="procurementModeThresholdId">
                  Threshold <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger id="procurementModeThresholdId">
                    <SelectValue placeholder="Select a threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    {modeThresholds.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No thresholds available
                      </div>
                    ) : (
                      modeThresholds.map(
                        (threshold: ProcurementModeThreshold) => (
                          <SelectItem key={threshold.id} value={threshold.id}>
                            ₱
                            {threshold.minThreshold.toLocaleString('en-PH', {
                              minimumFractionDigits: 2,
                            })}{' '}
                            -{' '}
                            {threshold.maxThreshold
                              ? `₱${threshold.maxThreshold.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                              : 'Infinite'}
                          </SelectItem>
                        ),
                      )
                    )}
                  </SelectContent>
                </Select>
                {field.state.meta.errors?.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0] instanceof Error
                      ? field.state.meta.errors[0].message
                      : String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          />
        )}

        {/* Threshold Info Display */}
        {selectedThreshold && (
          <div className="p-3 bg-muted rounded-md text-sm space-y-1">
            <p className="font-semibold">Threshold Boundaries:</p>
            <p>
              Min: ₱
              {selectedThreshold.minThreshold.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
              })}
            </p>
            {selectedThreshold.maxThreshold && (
              <p>
                Max: ₱
                {selectedThreshold.maxThreshold.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
        )}

        {/* Minimum Amount */}
        <form.Field
          name="minAmount"
          children={(field) => (
            <div className="space-y-3">
              <Label htmlFor="minAmount">
                Minimum Amount (₱) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="minAmount"
                type="number"
                step="0.01"
                min="0"
                value={minAmount === 0 ? '' : minAmount}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value ? parseFloat(e.target.value) : 0,
                  )
                }
                onBlur={field.handleBlur}
                placeholder="0.00"
              />
              {field.state.meta.errors?.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0] instanceof Error
                    ? field.state.meta.errors[0].message
                    : String(field.state.meta.errors[0])}
                </p>
              )}
              {minAmount && selectedThreshold && (
                <Slider
                  value={[minAmount]}
                  onValueChange={(val) => field.handleChange(val[0])}
                  min={selectedThreshold.minThreshold}
                  max={
                    selectedThreshold.maxThreshold ||
                    selectedThreshold.minThreshold * 10
                  }
                  step={1000}
                  className="mt-2"
                />
              )}
            </div>
          )}
        />

        {/* Maximum Amount */}
        <form.Field
          name="maxAmount"
          children={(field) => (
            <div className="space-y-3">
              <Label htmlFor="maxAmount">
                Maximum Amount (₱){' '}
                <span className="text-muted-foreground text-xs">
                  (Optional - leave blank for unlimited)
                </span>
              </Label>
              <Input
                id="maxAmount"
                type="number"
                step="0.01"
                min="0"
                value={maxAmount === 0 || maxAmount === null ? '' : maxAmount}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                onBlur={field.handleBlur}
                placeholder="0.00 (unlimited if blank)"
              />
              {field.state.meta.errors?.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0] instanceof Error
                    ? field.state.meta.errors[0].message
                    : String(field.state.meta.errors[0])}
                </p>
              )}
              {maxAmount && selectedThreshold && (
                <Slider
                  value={[maxAmount]}
                  onValueChange={(val) => field.handleChange(val[0])}
                  min={typeof minAmount === 'number' ? minAmount : 0}
                  max={
                    selectedThreshold.maxThreshold ||
                    selectedThreshold.minThreshold * 10
                  }
                  step={1000}
                  className="mt-2"
                />
              )}
            </div>
          )}
        />
      </form>
    </ResponsiveDialogDashtail>
  )
}
