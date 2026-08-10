import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import FieldInfo from '@/components/FieldInfo'
import { OPCRItem } from '../types'

const updateKPITargetSchema = z.object({
  assignedTargetQ1: z.number().min(0, 'Q1 target must be non-negative'),
  assignedTargetQ2: z.number().min(0, 'Q2 target must be non-negative'),
  assignedTargetQ3: z.number().min(0, 'Q3 target must be non-negative'),
  assignedTargetQ4: z.number().min(0, 'Q4 target must be non-negative'),
  assignedTargetAnnual: z.number().min(0, 'Annual target must be non-negative'),
  isLocked: z.boolean().default(false),
})

export type UpdateKPITargetFormValues = z.infer<typeof updateKPITargetSchema>

interface KPITargetDefaults {
  assignedTargetQ1: number
  assignedTargetQ2: number
  assignedTargetQ3: number
  assignedTargetQ4: number
  assignedTargetAnnual: number
  isLocked: boolean
}

// Helper to extract the form type
const useKPITargetFormInstance = (
  defaultValues: KPITargetDefaults,
  onTargetsUpdated: (targets: UpdateKPITargetFormValues) => void,
) =>
  useForm({
    defaultValues,
    validators: {
      onChange: updateKPITargetSchema,
    },
    onSubmit: async ({ value }) => {
      onTargetsUpdated(value)
    },
  })

export type KPITargetFormApi = ReturnType<typeof useKPITargetFormInstance>

interface UpdateKPITargetFormProps {
  opcrItem: OPCRItem
  onTargetsUpdated: (targets: UpdateKPITargetFormValues) => void
  setForm?: (form: KPITargetFormApi) => void
}

export default function UpdateKPITargetForm({
  opcrItem,
  onTargetsUpdated,
  setForm,
}: UpdateKPITargetFormProps) {
  const targetDefaults: KPITargetDefaults = {
    assignedTargetQ1: opcrItem.kpiAssignment?.assignedTargetQ1 || 0,
    assignedTargetQ2: opcrItem.kpiAssignment?.assignedTargetQ2 || 0,
    assignedTargetQ3: opcrItem.kpiAssignment?.assignedTargetQ3 || 0,
    assignedTargetQ4: opcrItem.kpiAssignment?.assignedTargetQ4 || 0,
    assignedTargetAnnual: opcrItem.kpiAssignment?.assignedTargetAnnual || 0,
    isLocked: opcrItem.kpiAssignment?.isLocked || false,
  }

  const form = useKPITargetFormInstance(targetDefaults, onTargetsUpdated)

  // Expose form to parent on creation
  setForm?.(form)

  return (
    <form
      id="update-kpi-target-form"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      {/* KPI Information Display */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">
            {opcrItem.kpiAssignment.fyActiveKPI?.name || 'Unnamed KPI'}
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {opcrItem.kpiAssignment.fyActiveKPI?.code}
        </p>
      </div>

      {/* Quarterly Targets */}
      <div className="space-y-4">
        <Label className="font-semibold">Quarterly Targets</Label>

        {/* Q1 Target */}
        <form.Field
          name="assignedTargetQ1"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Q1 Target</Label>
              <Input
                id={field.name}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Q2 Target */}
        <form.Field
          name="assignedTargetQ2"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Q2 Target</Label>
              <Input
                id={field.name}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Q3 Target */}
        <form.Field
          name="assignedTargetQ3"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Q3 Target</Label>
              <Input
                id={field.name}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Q4 Target */}
        <form.Field
          name="assignedTargetQ4"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Q4 Target</Label>
              <Input
                id={field.name}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      </div>

      {/* Annual Target */}
      <form.Field
        name="assignedTargetAnnual"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="font-semibold">
              Annual Target
            </Label>
            <Input
              id={field.name}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className="bg-blue-50 border-blue-200 font-semibold"
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      {/* Lock Status */}
      <form.Field
        name="isLocked"
        children={(field) => (
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Checkbox
              id={field.name}
              checked={field.state.value}
              onCheckedChange={(checked) =>
                field.handleChange(Boolean(checked))
              }
            />
            <Label htmlFor={field.name} className="text-sm cursor-pointer">
              Lock this KPI target
              <p className="text-xs text-gray-500 mt-1">
                Prevents further modifications to these targets
              </p>
            </Label>
            <FieldInfo field={field} />
          </div>
        )}
      />
    </form>
  )
}
