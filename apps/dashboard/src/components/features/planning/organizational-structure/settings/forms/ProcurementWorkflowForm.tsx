import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { ProcurementWorkflowSetting, ProcurementWorkflowFormValues } from '@/components/features/planning/organizational-structure/types'

const procurementWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2),
  code: z.string().min(1, 'Code is required'),
  approvalLevel: z.number().min(1, 'Approval level must be at least 1').max(10, 'Approval level cannot exceed 10'),
  isActive: z.boolean().optional().default(true),
})

interface ProcurementWorkflowFormProps {
  initialValues?: ProcurementWorkflowSetting
  onSubmit: (values: ProcurementWorkflowFormValues) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function ProcurementWorkflowForm({ initialValues, onSubmit, isLoading = false, mode = 'create' }: ProcurementWorkflowFormProps) {
  const form = useForm({
    defaultValues: initialValues || {
      name: '',
      code: '',
      approvalLevel: 1,
      isActive: true,
    },
    onSubmit: async (values) => {
      onSubmit(values.value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <form.Field
        name="name"
        validators={{ onChange: procurementWorkflowSchema.shape.name }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Workflow Name *</Label>
            <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g., Centralized, Decentralized" />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="code"
        validators={{ onChange: procurementWorkflowSchema.shape.code }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Code *</Label>
            <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g., CENT, DECENT" maxLength={50} />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="approvalLevel"
        validators={{ onChange: procurementWorkflowSchema.shape.approvalLevel }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Approval Level (1-10) *</Label>
            <Input id={field.name} name={field.name} type="number" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)} min="1" max="10" />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="isActive"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <Checkbox id={field.name} name={field.name} checked={field.state.value} onCheckedChange={(checked) => field.handleChange(!!checked)} />
            <Label htmlFor={field.name} className="font-normal cursor-pointer">
              Active
            </Label>
          </div>
        )}
      />

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Workflow' : 'Update Workflow'}
      </Button>
    </form>
  )
}
