import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AdministrativeLevelFormValues, AdministrativeLevel } from '@/components/features/planning/organizational-structure/types'
import { Loader2, X } from 'lucide-react'

const adminLevelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  canHaveChildren: z.boolean(),
})

// Export for consistency
export type { AdministrativeLevelFormValues } from '@/components/features/planning/organizational-structure/types'

export interface AdministrativeLevelFormProps {
  onSubmit: (values: AdministrativeLevelFormValues) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
  initialData?: AdministrativeLevel | Partial<AdministrativeLevelFormValues>
  onDirtyChange?: (isDirty: boolean) => void
}

export function AdministrativeLevelForm({
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
  initialData,
  onDirtyChange,
}: AdministrativeLevelFormProps) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? '',
      code: initialData?.code ?? '',
      canHaveChildren: initialData?.canHaveChildren ?? false,
    },
    // validate the entire form object with the Zod schema (avoid calling .parse directly)
    validators: {
      onChange: adminLevelSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as AdministrativeLevelFormValues)
    },
  })

  // Track dirty state for unsaved changes warning
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(form.state.isDirty)
    }
  }, [form.state.isDirty, onDirtyChange])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      <form.Field
        name="name"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-semibold">
              Level Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id={field.name}
              placeholder="e.g. Central, Regional, Provincial"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-9"
            />
            {field.state.meta.errors && (
              <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      <form.Field
        name="code"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-semibold">
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id={field.name}
              placeholder="e.g. CENTRAL, REGIONAL"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
              className="h-9 font-mono"
            />
            {field.state.meta.errors && (
              <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      <form.Field
        name="canHaveChildren"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor={field.name} className="text-sm font-semibold">
              Can Have Children
            </Label>
          </div>
        )}
      />

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="px-6">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="px-6">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            `${mode === 'create' ? 'Create' : 'Update'} Level`
          )}
        </Button>
      </div>
    </form>
  )
}
