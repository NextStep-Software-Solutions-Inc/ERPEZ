import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { PositionTypeSetting, PositionTypeFormValues } from '@/components/features/planning/organizational-structure/types'

const positionTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2),
  code: z.string().min(1, 'Code is required'),
  description: z.string().min(1, 'Description is required'),
  educationalLevel: z.string().min(1, 'Educational level is required'),
  category: z.string().min(1, 'Category is required'),
  isCareerEligibilityRequired: z.boolean().default(true),
  canReportDirectly: z.boolean().default(true),
  isActive: z.boolean().default(true),
})

interface PositionTypeFormProps {
  initialValues?: PositionTypeSetting
  onSubmit: (values: PositionTypeFormValues) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function PositionTypeForm({ initialValues, onSubmit, isLoading = false, mode = 'create' }: PositionTypeFormProps) {
  const form = useForm({
    defaultValues: initialValues || {
      name: '',
      code: '',
      description: '',
      educationalLevel: '',
      category: '',
      isCareerEligibilityRequired: false,
      canReportDirectly: true,
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
        validators={{ onChange: positionTypeSchema.shape.name }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Position Type Name *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Executive, Managerial, Technical"
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="code"
        validators={{ onChange: positionTypeSchema.shape.code }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Position Type Code *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., EXEC, MGR, TECH"
              maxLength={10}
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="description"
        validators={{ onChange: positionTypeSchema.shape.description }}
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
        name="educationalLevel"
        validators={{ onChange: positionTypeSchema.shape.educationalLevel }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Educational Level *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., College Level, High School"
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="category"
        validators={{ onChange: positionTypeSchema.shape.category }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Category *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., professional, sub-professional, non-professional"
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="isCareerEligibilityRequired"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
            />
            <Label htmlFor={field.name}>Career Eligibility Required</Label>
          </div>
        )}
      />

      <form.Field
        name="canReportDirectly"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
            />
            <Label htmlFor={field.name}>Can Report Directly</Label>
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
        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Position Type' : 'Update Position Type'}
      </Button>
    </form>
  )
}
