import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { OfficeCategoryFormValues } from '@/components/features/planning/organizational-structure/types'

// Export for consistency
export type { OfficeCategoryFormValues } from '@/components/features/planning/organizational-structure/types'

const officeCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').min(2),
  code: z.string().min(1, 'Code is required'),
  canHaveChildren: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

interface OfficeCategoryFormProps {
  initialValues?: Partial<OfficeCategoryFormValues>
  onSubmit: (values: OfficeCategoryFormValues) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function OfficeCategoryForm({ initialValues, onSubmit, isLoading = false, mode = 'create' }: OfficeCategoryFormProps) {
  const form = useForm({
    defaultValues: initialValues || {
      name: '',
      code: '',
      canHaveChildren: false,
      isActive: true,
    },
    // use the Zod schema object (not .parse) so react-form validates the full form value
    validators: {
      onChange: officeCategorySchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value as OfficeCategoryFormValues)
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
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Category Name *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Administrative, Technical"
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="code"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Category Code *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., ADMIN, TECH"
              maxLength={15}
            />
            {field.state.meta.errors.length > 0 && <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>}
          </div>
        )}
      />

      <form.Field
        name="canHaveChildren"
        children={(field) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(!!checked)}
              />
              <Label htmlFor={field.name} className="font-normal cursor-pointer">Can Have Child Categories</Label>
            </div>
          </div>
        )}
      />

      <form.Field
        name="isActive"
        children={(field) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(!!checked)}
              />
              <Label htmlFor={field.name} className="font-normal cursor-pointer">Active</Label>
            </div>
          </div>
        )}
      />

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Category' : 'Update Category'}
      </Button>
    </form>
  )
}


