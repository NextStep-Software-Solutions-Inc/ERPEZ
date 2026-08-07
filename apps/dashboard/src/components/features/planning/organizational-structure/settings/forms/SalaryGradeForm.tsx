import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { SalaryGradeSetting, SalaryGradeFormValues } from '@/components/features/planning/organizational-structure/types'

const salaryGradeSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2),
  code: z.string().min(1, 'Code is required'),
  gradeNumber: z.number().min(1, 'Grade number must be at least 1').max(40, 'Grade number cannot exceed 40'),
  stepIncrementAmount: z.number().min(0, 'Step increment must be non-negative'),
  numberOfSteps: z.number().min(1, 'Number of steps must be at least 1').max(20, 'Number of steps cannot exceed 20'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  description: z.string().min(1, 'Description is required'),
  isActive: z.boolean().default(true),
})

interface SalaryGradeFormProps {
  initialValues?: SalaryGradeSetting
  onSubmit: (values: SalaryGradeFormValues) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function SalaryGradeForm({ initialValues, onSubmit, isLoading = false, mode = 'create' }: SalaryGradeFormProps) {
  const form = useForm({
    defaultValues: initialValues || {
      name: '',
      code: '',
      gradeNumber: 1,
      stepIncrementAmount: 0,
      numberOfSteps: 8,
      effectiveDate: new Date().toISOString().split('T')[0],
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
        validators={{ onChange: salaryGradeSchema.shape.name }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Salary Grade Name *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Salary Grade 1"
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="code"
        validators={{ onChange: salaryGradeSchema.shape.code }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Salary Grade Code *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., sg-1"
              maxLength={10}
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="gradeNumber"
        validators={{ onChange: salaryGradeSchema.shape.gradeNumber }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Grade Number (1-40) *</Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)}
              min="1"
              max="40"
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="stepIncrementAmount"
        validators={{ onChange: salaryGradeSchema.shape.stepIncrementAmount }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Step Increment Amount *</Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="numberOfSteps"
        validators={{ onChange: salaryGradeSchema.shape.numberOfSteps }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Number of Steps (1-20) *</Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)}
              min="1"
              max="20"
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="effectiveDate"
        validators={{ onChange: salaryGradeSchema.shape.effectiveDate }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Effective Date *</Label>
            <Input
              id={field.name}
              name={field.name}
              type="date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="description"
        validators={{ onChange: salaryGradeSchema.shape.description }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Description *</Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter description"
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="isActive"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
            />
            <Label htmlFor={field.name}>Active</Label>
          </div>
        )}
      />

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Salary Grade' : 'Update Salary Grade'}
      </Button>
    </form>
  )
}
