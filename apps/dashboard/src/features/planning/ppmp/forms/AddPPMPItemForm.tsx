import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import FieldInfo from '@/components/FieldInfo'
import { getProcurementModesRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementModesRequest'
import { FieldDescriptionTooltip } from '../components/FieldDescriptionTooltip'
import { cn } from '@/lib/utils'

const useProcurementModes = createQueryHookFromTemplate(
  getProcurementModesRequest,
)

export const ppmpItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().default(''),
  unit: z.string().min(1, 'Unit of measure is required'),
  unitPrice: z.number().min(0.01, 'Unit price must be greater than 0'),
  plannedQuantity: z.number().int().min(1, 'Planned quantity must be at least 1'),
  procurementModeId: z.string().min(1, 'Procurement mode is required'),
  papCode: z.string().default(''),
  projectType: z
    .enum([
      'Goods',
      'Infrastructure',
      'ConsultingServices',
      'GeneralSupportServices',
    ])
    .default('Goods'),
  preProcurementConference: z.boolean().default(false),
  procurementStartDate: z.string().min(1, 'Procurement start date is required'),
  procurementEndDate: z.string().min(1, 'Procurement end date is required'),
  expectedDeliveryStart: z.string().min(1, 'Expected delivery start date is required'),
  expectedDeliveryEnd: z.string().min(1, 'Expected delivery end date is required'),
  remarks: z.string().default(''),
}).refine(data => {
  if (data.procurementStartDate && data.procurementEndDate && data.procurementEndDate < data.procurementStartDate) {
    return false
  }
  return true
}, {
  message: 'Procurement end date cannot be before start date',
  path: ['procurementEndDate']
}).refine(data => {
  if (data.expectedDeliveryStart && data.procurementStartDate && data.expectedDeliveryStart < data.procurementStartDate) {
    return false
  }
  return true
}, {
  message: 'Expected delivery start date cannot be before procurement start date',
  path: ['expectedDeliveryStart']
}).refine(data => {
  if (data.expectedDeliveryStart && data.expectedDeliveryEnd && data.expectedDeliveryEnd < data.expectedDeliveryStart) {
    return false
  }
  return true
}, {
  message: 'Expected delivery end date cannot be before start date',
  path: ['expectedDeliveryEnd']
})

export type PPMPItemFormValues = z.infer<typeof ppmpItemSchema>

interface AddPPMPItemFormProps {
  formId?: string
  initialValues?: Partial<PPMPItemFormValues>
  onSubmit: (values: PPMPItemFormValues) => void
  isLoading?: boolean
}

export function AddPPMPItemForm({
  formId = 'add-ppmp-item-form',
  initialValues,
  onSubmit,
  isLoading = false,
}: AddPPMPItemFormProps) {
  const { data: modesResp, isLoading: isModesLoading } = useProcurementModes({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })

  const procurementModes = modesResp?.data ?? []

  const form = useForm({
    defaultValues: {
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      unit: initialValues?.unit ?? 'pcs',
      unitPrice: initialValues?.unitPrice ?? 0,
      plannedQuantity: initialValues?.plannedQuantity ?? 1,
      procurementModeId: initialValues?.procurementModeId ?? '',
      papCode: initialValues?.papCode ?? '',
      projectType: (initialValues?.projectType as any) ?? 'Goods',
      preProcurementConference:
        initialValues?.preProcurementConference ?? false,
      procurementStartDate: initialValues?.procurementStartDate ?? '',
      procurementEndDate: initialValues?.procurementEndDate ?? '',
      expectedDeliveryStart: initialValues?.expectedDeliveryStart ?? '',
      expectedDeliveryEnd: initialValues?.expectedDeliveryEnd ?? '',
      remarks: initialValues?.remarks ?? '',
    } as PPMPItemFormValues,
    onSubmit: async ({ value }) => {
      // Validate using Zod schema before submission
      try {
        const validatedData = await ppmpItemSchema.parseAsync(value)
        onSubmit(validatedData)
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Surface Zod validation errors to form fields with proper error display
          error.issues.forEach((issue) => {
            const fieldName = issue.path[0] as string | undefined
            if (fieldName) {
              // Mark field as touched and set validation error
              const field = form.getFieldMeta(
                fieldName as keyof PPMPItemFormValues,
              )
              if (field) {
                form.setFieldMeta(
                  fieldName as keyof PPMPItemFormValues,
                  (prev) => ({
                    ...prev,
                    errors: [issue.message],
                    isTouched: true,
                    isValidating: false,
                  }),
                )
              }
            }
          })
          // Throw error to prevent form submission without visible feedback
          throw new Error(
            'Form validation failed. Please check all required fields.',
          )
        }
        throw error
      }
    },
  })

  useEffect(() => {
    form.reset({
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      unit: initialValues?.unit ?? 'pcs',
      unitPrice: initialValues?.unitPrice ?? 0,
      plannedQuantity: initialValues?.plannedQuantity ?? 1,
      procurementModeId: initialValues?.procurementModeId ?? '',
      papCode: initialValues?.papCode ?? '',
      projectType: (initialValues?.projectType as any) ?? 'Goods',
      preProcurementConference:
        initialValues?.preProcurementConference ?? false,
      procurementStartDate: initialValues?.procurementStartDate ?? '',
      procurementEndDate: initialValues?.procurementEndDate ?? '',
      expectedDeliveryStart: initialValues?.expectedDeliveryStart ?? '',
      expectedDeliveryEnd: initialValues?.expectedDeliveryEnd ?? '',
      remarks: initialValues?.remarks ?? '',
    } as PPMPItemFormValues)
  }, [initialValues, form])

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4 font-sans"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              if (!value?.trim()) return 'Item name is required'
              return undefined
            },
          }}
          children={(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor={field.name}>Item Name *</Label>
                <FieldDescriptionTooltip fieldKey="name" className="h-4 w-4" />
              </div>
              <Input
                id={field.name}
                placeholder="e.g. Laser Printer Toner"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isLoading}
                className="border-default-250 focus-visible:ring-primary/20 text-xs"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        <form.Field
          name="unit"
          validators={{
            onChange: ({ value }) => {
              if (!value?.trim()) return 'Unit of measure is required'
              return undefined
            },
          }}
          children={(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor={field.name}>Unit of Measure *</Label>
                <FieldDescriptionTooltip fieldKey="unit" className="h-4 w-4" />
              </div>
              <Input
                id={field.name}
                placeholder="e.g. cartridge, box, pc"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isLoading}
                className="border-default-250 focus-visible:ring-primary/20 text-xs"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="unitPrice"
          validators={{
            onChange: ({ value }) => {
              if (!value || value <= 0)
                return 'Unit price must be greater than 0'
              return undefined
            },
          }}
          children={(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor={field.name}>Unit Price *</Label>
                <FieldDescriptionTooltip
                  fieldKey="unitPrice"
                  className="h-4 w-4"
                />
              </div>
              <Input
                id={field.name}
                type="number"
                step="0.01"
                placeholder="0.00"
                value={field.state.value || ''}
                onChange={(e) =>
                  field.handleChange(Number.parseFloat(e.target.value) || 0)
                }
                disabled={isLoading}
                className="border-default-250 focus-visible:ring-primary/20 text-xs"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        <form.Field
          name="plannedQuantity"
          validators={{
            onChange: ({ value }) => {
              if (!value || value <= 0)
                return 'Planned quantity must be at least 1'
              return undefined
            },
          }}
          children={(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor={field.name}>Planned Quantity *</Label>
                <FieldDescriptionTooltip
                  fieldKey="plannedQuantity"
                  className="h-4 w-4"
                />
              </div>
              <Input
                id={field.name}
                type="number"
                step="1"
                min="1"
                placeholder="1"
                value={field.state.value || ''}
                onChange={(e) =>
                  field.handleChange(Number.parseInt(e.target.value, 10) || 0)
                }
                disabled={isLoading}
                className="border-default-250 focus-visible:ring-primary/20 text-xs"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="procurementModeId"
          validators={{
            onChange: ({ value }) => {
              if (!value?.trim()) return 'Procurement mode is required'
              return undefined
            },
          }}
          children={(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor={field.name}>Procurement Mode *</Label>
                <FieldDescriptionTooltip
                  fieldKey="procurementModeId"
                  className="h-4 w-4"
                />
              </div>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
                disabled={
                  isLoading || isModesLoading || procurementModes.length === 0
                }
              >
                <SelectTrigger
                  id={field.name}
                  className="w-full h-9 border-default-250"
                >
                  <SelectValue
                    placeholder={
                      isModesLoading
                        ? 'Loading modes...'
                        : procurementModes.length === 0
                          ? 'No modes available'
                          : 'Select mode'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {procurementModes.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </div>
          )}
        />

        <form.Field
          name="projectType"
          children={(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor={field.name}>Project Type</Label>
                <FieldDescriptionTooltip
                  fieldKey="projectType"
                  className="h-4 w-4"
                />
              </div>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as any)}
                disabled={isLoading}
              >
                <SelectTrigger
                  id={field.name}
                  className="w-full h-9 border-default-250"
                >
                  <SelectValue
                    placeholder="Select type"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Goods">Goods</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="ConsultingServices">
                    Consulting Services
                  </SelectItem>
                  <SelectItem value="GeneralSupportServices">
                    General Support Services
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </div>
          )}
        />
      </div>

      <div>
        <form.Field
          name="papCode"
          children={(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor={field.name}>PAP Code</Label>
                <FieldDescriptionTooltip
                  fieldKey="papCode"
                  className="h-4 w-4"
                />
              </div>
              <Input
                id={field.name}
                placeholder="e.g. 5-02-03-010"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isLoading}
                className="border-default-250 focus-visible:ring-primary/20 text-xs"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      </div>

      <form.Field
        name="description"
        children={(field) => (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor={field.name}>Description / Specifications</Label>
              <FieldDescriptionTooltip
                fieldKey="description"
                className="h-4 w-4"
              />
            </div>
            <Textarea
              id={field.name}
              placeholder="Detailed specifications of the item..."
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isLoading}
              className="min-h-20 border-default-250 focus-visible:ring-primary/20 text-xs"
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      <form.Field
        name="preProcurementConference"
        children={(field) => (
          <div className="flex items-center gap-2 py-1">
            <Checkbox
              id={field.name}
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(!!checked)}
              disabled={isLoading}
            />
            <div className="flex items-center gap-1">
              <Label
                htmlFor={field.name}
                className="text-xs font-semibold leading-none cursor-pointer select-none"
              >
                Pre-Procurement Conference
              </Label>
              <FieldDescriptionTooltip
                fieldKey="preProcurementConference"
                className="h-4 w-4"
              />
            </div>
          </div>
        )}
      />

      <div className="border-t border-default-150 pt-4 mt-2">
        <h4 className="text-xs font-bold text-default-800 uppercase tracking-wider mb-3">
          Procurement & Delivery Timeline
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field
            name="procurementStartDate"
            validators={{
              onChange: ({ value }) => {
                if (!value?.trim()) return 'Procurement start date is required'
                return undefined
              },
            }}
            children={(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Label htmlFor={field.name}>Procurement Start Date *</Label>
                  <FieldDescriptionTooltip
                    fieldKey="procurementStartDate"
                    className="h-4 w-4"
                  />
                </div>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  className={cn(
                    'border-default-250 focus-visible:ring-primary/20 text-xs',
                    field.state.meta.errors?.[0] && 'border-red-500 bg-red-50/20'
                  )}
                />
                <FieldInfo field={field} />
              </div>
            )}
          />

          <form.Field
            name="procurementEndDate"
            validators={{
              onChange: ({ value, fieldApi }) => {
                if (!value?.trim()) return 'Procurement end date is required'
                const start = fieldApi.form.getFieldValue('procurementStartDate')
                if (start && value < start) {
                  return 'Procurement end date cannot be before start date'
                }
                return undefined
              },
            }}
            children={(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Label htmlFor={field.name}>Procurement End Date *</Label>
                  <FieldDescriptionTooltip
                    fieldKey="procurementEndDate"
                    className="h-4 w-4"
                  />
                </div>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  className={cn(
                    'border-default-250 focus-visible:ring-primary/20 text-xs',
                    field.state.meta.errors?.[0] && 'border-red-500 bg-red-50/20'
                  )}
                />
                <FieldInfo field={field} />
              </div>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <form.Field
            name="expectedDeliveryStart"
            validators={{
              onChange: ({ value, fieldApi }) => {
                if (!value?.trim()) return 'Expected delivery start date is required'
                const procStart = fieldApi.form.getFieldValue('procurementStartDate')
                if (procStart && value < procStart) {
                  return 'Delivery start date cannot be before procurement start date'
                }
                return undefined
              },
            }}
            children={(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Label htmlFor={field.name}>Expected Delivery Start *</Label>
                  <FieldDescriptionTooltip
                    fieldKey="expectedDeliveryStart"
                    className="h-4 w-4"
                  />
                </div>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  className={cn(
                    'border-default-250 focus-visible:ring-primary/20 text-xs',
                    field.state.meta.errors?.[0] && 'border-red-500 bg-red-50/20'
                  )}
                />
                <FieldInfo field={field} />
              </div>
            )}
          />

          <form.Field
            name="expectedDeliveryEnd"
            validators={{
              onChange: ({ value, fieldApi }) => {
                if (!value?.trim()) return 'Expected delivery end date is required'
                const start = fieldApi.form.getFieldValue('expectedDeliveryStart')
                if (start && value < start) {
                  return 'Expected delivery end date cannot be before start date'
                }
                return undefined
              },
            }}
            children={(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Label htmlFor={field.name}>Expected Delivery End *</Label>
                  <FieldDescriptionTooltip
                    fieldKey="expectedDeliveryEnd"
                    className="h-4 w-4"
                  />
                </div>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  className={cn(
                    'border-default-250 focus-visible:ring-primary/20 text-xs',
                    field.state.meta.errors?.[0] && 'border-red-500 bg-red-50/20'
                  )}
                />
                <FieldInfo field={field} />
              </div>
            )}
          />
        </div>
      </div>

      <form.Field
        name="remarks"
        children={(field) => (
          <div className="space-y-1.5 border-t border-default-150 pt-4 mt-2">
            <div className="flex items-center gap-1">
              <Label htmlFor={field.name}>Remarks / Notes</Label>
              <FieldDescriptionTooltip fieldKey="remarks" className="h-4 w-4" />
            </div>
            <Textarea
              id={field.name}
              placeholder="Additional remarks or notes..."
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isLoading}
              className="min-h-15 border-default-250 focus-visible:ring-primary/20 text-xs"
            />
            <FieldInfo field={field} />
          </div>
        )}
      />
    </form>
  )
}
