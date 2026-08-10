import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { PMTMaximumSeatsSetting } from '@/components/features/planning/organizational-structure/types'

const pmtMaximumSeatsSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  maxSeats: z.number().min(1),
  organizationWide: z.boolean().default(true),
  officeId: z.string().optional(),
  minimumGradeLevel: z.string().optional(),
  reportingLevel: z.enum(['executive', 'managerial', 'supervisory']).optional(),
  effectiveDate: z.string().optional(),
})

export type PMTMaximumSeatsFormValues = z.infer<typeof pmtMaximumSeatsSchema>

interface PMTMaximumSeatsFormProps {
  initialValues?: PMTMaximumSeatsSetting
  onSubmit: (values: PMTMaximumSeatsFormValues) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function PMTMaximumSeatsForm({ initialValues, onSubmit, isLoading = false, mode = 'create' }: PMTMaximumSeatsFormProps) {
  const form = useForm({
    defaultValues: initialValues || {
      name: '',
      code: '',
      description: '',
      isActive: true,
      maxSeats: 5,
      organizationWide: true,
      officeId: '',
      minimumGradeLevel: '',
      reportingLevel: 'executive' as const,
      effectiveDate: '',
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
        validators={{ onChange: pmtMaximumSeatsSchema.shape.name }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>PMT Setting Name *</Label>
            <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g., Executive Level PMT" />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="code"
        validators={{ onChange: pmtMaximumSeatsSchema.shape.code }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>PMT Code *</Label>
            <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g., PMTEX, PMTMGR" maxLength={10} />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="maxSeats"
        validators={{ onChange: pmtMaximumSeatsSchema.shape.maxSeats }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Maximum Seats *</Label>
            <Input id={field.name} name={field.name} type="number" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)} min="1" placeholder="Number of seats" />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="reportingLevel"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Reporting Level</Label>
            <Select value={field.state.value || ''} onValueChange={(val) => field.handleChange(val as 'executive' | 'managerial' | 'supervisory')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive Level</SelectItem>
                <SelectItem value="managerial">Managerial Level</SelectItem>
                <SelectItem value="supervisory">Supervisory Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      />

      <form.Field
        name="minimumGradeLevel"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Minimum Grade Level</Label>
            <Input id={field.name} name={field.name} value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g., SG-25" />
          </div>
        )}
      />

      <form.Field
        name="effectiveDate"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Effective Date</Label>
            <Input id={field.name} name={field.name} type="date" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} />
          </div>
        )}
      />

      <form.Field
        name="description"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Description</Label>
            <Textarea id={field.name} name={field.name} value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} placeholder="Enter description" />
          </div>
        )}
      />

      <form.Field
        name="isActive"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Active</Label>
            <div className="flex items-center gap-2">
              <input
                id={field.name}
                name={field.name}
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 rounded border border-gray-300"
              />
              <label htmlFor={field.name} className="text-sm font-medium">Enable this setting</label>
            </div>
          </div>
        )}
      />

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : mode === 'create' ? 'Create PMT Setting' : 'Update PMT Setting'}
      </Button>
    </form>
  )
}
