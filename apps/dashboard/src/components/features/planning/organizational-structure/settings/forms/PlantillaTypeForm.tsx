import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { PlantillaTypeSetting, PlantillaTypeFormValues } from '@/components/features/planning/organizational-structure/types'

const plantillaTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2),
  code: z.string().min(1, 'Code is required'),
  duration: z.number().nullable().optional(),
  requiresActingAppointments: z.boolean().default(false),
  allowsContractual: z.boolean().default(false),
  benefits: z.string().min(1, 'Benefits is required'),
  isActive: z.boolean().default(true),
})

interface PlantillaTypeFormProps {
  initialValues?: PlantillaTypeSetting
  onSubmit: (values: PlantillaTypeFormValues) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function PlantillaTypeForm({ initialValues, onSubmit, isLoading = false, mode = 'create' }: PlantillaTypeFormProps) {
  const form = useForm({
    defaultValues: initialValues || {
      name: '',
      code: '',
      duration: null,
      requiresActingAppointments: false,
      allowsContractual: false,
      benefits: '',
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
        validators={{ onChange: plantillaTypeSchema.shape.name }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Plantilla Type Name *</Label>
            <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g., Permanent, Casual, Contractual" />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="code"
        validators={{ onChange: plantillaTypeSchema.shape.code }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Plantilla Type Code *</Label>
            <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g., PERM, CASUAL, CONT" maxLength={10} />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="duration"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Duration (months)</Label>
            <Input id={field.name} name={field.name} type="number" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : null)} placeholder="e.g., 12, 24" />
          </div>
        )}
      />

      <form.Field
        name="benefits"
        validators={{ onChange: plantillaTypeSchema.shape.benefits }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Benefits *</Label>
            <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g., Health Insurance, Pension" />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="requiresActingAppointments"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <Checkbox id={field.name} checked={field.state.value} onCheckedChange={(checked) => field.handleChange(Boolean(checked))} />
            <Label htmlFor={field.name}>Requires Acting Appointments</Label>
          </div>
        )}
      />

      <form.Field
        name="allowsContractual"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <Checkbox id={field.name} checked={field.state.value} onCheckedChange={(checked) => field.handleChange(Boolean(checked))} />
            <Label htmlFor={field.name}>Allows Contractual</Label>
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

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Plantilla Type' : 'Update Plantilla Type'}
      </Button>
    </form>
  )
}
