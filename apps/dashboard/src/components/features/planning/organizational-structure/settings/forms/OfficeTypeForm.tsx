import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { OfficeTypeSetting } from '@/components/features/planning/organizational-structure/types'

const officeTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  code: z.string().min(1, 'Code is required'),
  canHaveChildren: z.boolean().default(true),
})

export type OfficeTypeFormValues = z.infer<typeof officeTypeSchema>

interface OfficeTypeFormProps {
  initialValues?: OfficeTypeSetting
  onSubmit: (values: OfficeTypeFormValues) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function OfficeTypeForm({ initialValues, onSubmit, isLoading = false, mode = 'create' }: OfficeTypeFormProps) {
  const form = useForm({
    defaultValues: initialValues || {
      name: '',
      code: '',
      canHaveChildren: true,
    },
    validators: {
      onChange: officeTypeSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value)
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
      {/* Name Field */}
      <form.Field
        name="name"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Office Type Name *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="e.g., Division, Section, Office"
              className="w-full"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      {/* Code Field */}
      <form.Field
        name="code"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Office Type Code *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="e.g., DIV, SEC, OFF"
              className="w-full"
              maxLength={10}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      {/* Can Have Children Field */}
      <form.Field
        name="canHaveChildren"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
            />
            <Label htmlFor={field.name}>Can Have Sub-Units</Label>
          </div>
        )}
      />

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Office Type' : 'Update Office Type'}
      </Button>
    </form>
  )
}
