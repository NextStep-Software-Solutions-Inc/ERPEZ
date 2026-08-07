import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { SatelliteClusterSetting, SatelliteClusterFormValues } from '@/components/features/planning/organizational-structure/types'

const satelliteClusterSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2),
  code: z.string().min(1, 'Code is required'),
  address: z.string().min(1, 'Address is required'),
  maxSubUnits: z.number().min(1, 'Max Sub-Units must be at least 1').max(50, 'Max Sub-Units cannot exceed 50'),
  isActive: z.boolean().optional().default(true),
})

interface SatelliteClusterFormProps {
  initialValues?: SatelliteClusterSetting
  onSubmit: (values: SatelliteClusterFormValues) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function SatelliteClusterForm({ initialValues, onSubmit, isLoading = false, mode = 'create' }: SatelliteClusterFormProps) {
  const form = useForm({
    defaultValues: initialValues || {
      name: '',
      code: '',
      address: '',
      maxSubUnits: 5,
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
        validators={{ onChange: satelliteClusterSchema.shape.name }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Cluster Name *</Label>
            <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g., Cagayan de Oro City" />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="code"
        validators={{ onChange: satelliteClusterSchema.shape.code }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Code *</Label>
            <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g., cdoc" maxLength={20} />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="address"
        validators={{ onChange: satelliteClusterSchema.shape.address }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Address *</Label>
            <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g., Lapasan, Cagayan De Oro City" />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="maxSubUnits"
        validators={{ onChange: satelliteClusterSchema.shape.maxSubUnits }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Max Sub-Units (1-50) *</Label>
            <Input id={field.name} name={field.name} type="number" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)} min="1" max="50" />
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
        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Cluster' : 'Update Cluster'}
      </Button>
    </form>
  )
}
