import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { StepSetting, StepFormValues as StepFormValuesType } from '@/components/features/planning/organizational-structure/types'

const stepSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2),
  code: z.string().min(1, 'Code is required'),
  stepNumber: z.number().min(1, 'Step number must be at least 1'),
  minStep: z.number().min(0, 'Minimum step must be at least 0'),
  maxStep: z.number().min(1, 'Maximum step must be at least 1'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
}).refine(
  (data) => data.maxStep >= data.minStep,
  {
    message: 'Maximum step must be greater than or equal to minimum step',
    path: ['maxStep'],
  }
)

export type StepFormValues = StepFormValuesType

interface StepFormProps {
  initialValues?: StepSetting
  onSubmit: (values: StepFormValuesType) => Promise<void> | void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function StepForm({ initialValues, onSubmit, isLoading = false, mode = 'create' }: StepFormProps) {
  const form = useForm({
    defaultValues: initialValues || {
      name: '',
      code: '',
      stepNumber: 1,
      minStep: 0,
      maxStep: 1,
      description: '',
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
        validators={{ onChange: stepSchema.shape.name }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Step Name *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Step 1, Entry Level"
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="code"
        validators={{ onChange: stepSchema.shape.code }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Step Code *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., STEP-1, STEP-2"
              maxLength={20}
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="stepNumber"
        validators={{ onChange: stepSchema.shape.stepNumber }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Step Number *</Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              placeholder="e.g., 1, 2, 3"
              min="1"
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="minStep"
          validators={{ onChange: stepSchema.shape.minStep }}
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Minimum Step *</Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                placeholder="e.g., 0"
                min="0"
              />
              {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
            </div>
          )}
        />

        <form.Field
          name="maxStep"
          validators={{ onChange: stepSchema.shape.maxStep }}
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Maximum Step *</Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                placeholder="e.g., 1"
                min="1"
              />
              {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
            </div>
          )}
        />
      </div>

      <form.Field
        name="description"
        validators={{ onChange: stepSchema.shape.description }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Description</Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Initial position at entry level"
              rows={3}
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="isActive"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <Checkbox id={field.name} checked={field.state.value} onCheckedChange={(checked) => field.handleChange(Boolean(checked))} />
            <Label htmlFor={field.name}>Active</Label>
          </div>
        )}
      />

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="min-w-[100px]">
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Step' : 'Update Step'}
        </Button>
      </div>
    </form>
  )
}
