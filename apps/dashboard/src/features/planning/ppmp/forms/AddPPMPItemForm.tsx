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
import { FieldGuidanceHint } from '../components/FieldGuidanceHint'
import { getColumnGuideline } from '../lib/ngpaGuidelinesReference'

const useProcurementModes = createQueryHookFromTemplate(
  getProcurementModesRequest,
)

export const ppmpItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().default(''),
  unit: z.string().min(1, 'Unit of measure is required'),
  unitPrice: z.number().min(0.01, 'Unit price must be greater than 0'),
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
  procurementStartDate: z.string().default(''),
  procurementEndDate: z.string().default(''),
  expectedDeliveryStart: z.string().default(''),
  expectedDeliveryEnd: z.string().default(''),
  remarks: z.string().default(''),
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
      // Validate on submit
      try {
        await ppmpItemSchema.parseAsync(value)
        onSubmit(value)
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('Validation error:', error.issues)
          // Form will show field-level errors
        }
      }
    },
  })

  useEffect(() => {
    form.reset({
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      unit: initialValues?.unit ?? 'pcs',
      unitPrice: initialValues?.unitPrice ?? 0,
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
                {getColumnGuideline(1) && (
                  <FieldGuidanceHint
                    guideline={getColumnGuideline(1)!}
                    projectType={
                      form.getFieldValue('projectType') === 'Infrastructure'
                        ? 'infrastructure'
                        : form.getFieldValue('projectType') ===
                            'ConsultingServices'
                          ? 'consulting'
                          : 'goods'
                    }
                  />
                )}
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
                {getColumnGuideline(3) && (
                  <FieldGuidanceHint
                    guideline={getColumnGuideline(3)!}
                    projectType={
                      form.getFieldValue('projectType') === 'Infrastructure'
                        ? 'infrastructure'
                        : form.getFieldValue('projectType') ===
                            'ConsultingServices'
                          ? 'consulting'
                          : 'goods'
                    }
                  />
                )}
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
              if (!value || value <= 0) return 'Unit price must be greater than 0'
              return undefined
            },
          }}
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>Unit Price *</Label>
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
          name="projectType"
          children={(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor={field.name}>Project Type</Label>
                {getColumnGuideline(2) && (
                  <FieldGuidanceHint
                    guideline={getColumnGuideline(2)!}
                    projectType={
                      field.state.value === 'Infrastructure'
                        ? 'infrastructure'
                        : field.state.value === 'ConsultingServices'
                          ? 'consulting'
                          : 'goods'
                    }
                  />
                )}
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
                  <SelectValue placeholder="Select type" />
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
                {getColumnGuideline(4) && (
                  <FieldGuidanceHint
                    guideline={getColumnGuideline(4)!}
                    projectType={
                      form.getFieldValue('projectType') === 'Infrastructure'
                        ? 'infrastructure'
                        : form.getFieldValue('projectType') ===
                            'ConsultingServices'
                          ? 'consulting'
                          : 'goods'
                    }
                  />
                )}
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
          name="papCode"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>PAP Code</Label>
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
            <Label htmlFor={field.name}>Description / Specifications</Label>
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
                Pre-Procurement Conference Required
              </Label>
              {getColumnGuideline(5) && (
                <FieldGuidanceHint
                  guideline={getColumnGuideline(5)!}
                  projectType={
                    form.getFieldValue('projectType') === 'Infrastructure'
                      ? 'infrastructure'
                      : form.getFieldValue('projectType') ===
                          'ConsultingServices'
                        ? 'consulting'
                        : 'goods'
                  }
                />
              )}
            </div>
          </div>
        )}
      />

      <div className="border-t border-default-150 pt-4 mt-2">
        <h4 className="text-xs font-bold text-default-800 uppercase tracking-wider mb-3">
          Procurement & Delivery Timeline (Optional)
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field
            name="procurementStartDate"
            children={(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Label htmlFor={field.name}>Procurement Start Date</Label>
                  {getColumnGuideline(6) && (
                    <FieldGuidanceHint
                      guideline={getColumnGuideline(6)!}
                      projectType={
                        form.getFieldValue('projectType') === 'Infrastructure'
                          ? 'infrastructure'
                          : form.getFieldValue('projectType') ===
                              'ConsultingServices'
                            ? 'consulting'
                            : 'goods'
                      }
                    />
                  )}
                </div>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  className="border-default-250 focus-visible:ring-primary/20 text-xs"
                />
              </div>
            )}
          />

          <form.Field
            name="procurementEndDate"
            children={(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Label htmlFor={field.name}>Procurement End Date</Label>
                  {getColumnGuideline(7) && (
                    <FieldGuidanceHint
                      guideline={getColumnGuideline(7)!}
                      projectType={
                        form.getFieldValue('projectType') === 'Infrastructure'
                          ? 'infrastructure'
                          : form.getFieldValue('projectType') ===
                              'ConsultingServices'
                            ? 'consulting'
                            : 'goods'
                      }
                    />
                  )}
                </div>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  className="border-default-250 focus-visible:ring-primary/20 text-xs"
                />
              </div>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <form.Field
            name="expectedDeliveryStart"
            children={(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Label htmlFor={field.name}>Expected Delivery Start</Label>
                  {getColumnGuideline(8) && (
                    <FieldGuidanceHint
                      guideline={getColumnGuideline(8)!}
                      projectType={
                        form.getFieldValue('projectType') === 'Infrastructure'
                          ? 'infrastructure'
                          : form.getFieldValue('projectType') ===
                              'ConsultingServices'
                            ? 'consulting'
                            : 'goods'
                      }
                    />
                  )}
                </div>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  className="border-default-250 focus-visible:ring-primary/20 text-xs"
                />
              </div>
            )}
          />

          <form.Field
            name="expectedDeliveryEnd"
            children={(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Label htmlFor={field.name}>Expected Delivery End</Label>
                  {getColumnGuideline(8) && (
                    <FieldGuidanceHint
                      guideline={getColumnGuideline(8)!}
                      projectType={
                        form.getFieldValue('projectType') === 'Infrastructure'
                          ? 'infrastructure'
                          : form.getFieldValue('projectType') ===
                              'ConsultingServices'
                            ? 'consulting'
                            : 'goods'
                      }
                    />
                  )}
                </div>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  className="border-default-250 focus-visible:ring-primary/20 text-xs"
                />
              </div>
            )}
          />
        </div>
      </div>

      <form.Field
        name="remarks"
        children={(field) => (
          <div className="space-y-1.5 border-t border-default-150 pt-4 mt-2">
            <Label htmlFor={field.name}>Remarks</Label>
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
