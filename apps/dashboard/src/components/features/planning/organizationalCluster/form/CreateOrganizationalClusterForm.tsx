import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// Export schema and type for reuse
export const createOrganizationalClusterSchema = z.object({
  name: z.string().min(2, 'Organizational cluster name is required'),
  description: z.string().optional().nullable(),
})

export type CreateOrganizationalClusterFormType = z.infer<
  typeof createOrganizationalClusterSchema
>

interface CreateOrganizationalClusterFormProps {
  onSubmit: (data: CreateOrganizationalClusterFormType) => void
  onCancel: (form: any) => void
  isLoading?: boolean
  mode?: 'create' | 'update'
  initialValues?: Partial<CreateOrganizationalClusterFormType>
}

export default function CreateOrganizationalClusterForm({
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  initialValues,
}: CreateOrganizationalClusterFormProps) {
  const form = useForm({
    defaultValues: initialValues ?? {
      name: '',
      description: '',
    },
    onSubmit: async (values) => {
      const validationResult = createOrganizationalClusterSchema.safeParse(
        values.value,
      )
      if (validationResult.success) {
        onSubmit(validationResult.data)
      } else {
        console.error('Validation errors:', validationResult.error.flatten())
        throw new Error('Form validation failed')
      }
    },
  })

  const handleSubmit = () => {
    form.handleSubmit()
  }

  const handleBackOrCancel = () => {
    onCancel(form)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleSubmit()
      }}
      className="flex flex-col space-y-6"
    >
      {/* Form Content */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        <form.Field
          name="name"
          children={(field: any) => (
            <div className="space-y-2">
              <label className="font-medium">Organizational Cluster</label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter organizational cluster name"
                disabled={isLoading}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-600">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        />

        <form.Field
          name="description"
          children={(field: any) => (
            <div className="space-y-2">
              <label className="font-medium">Description</label>
              <Textarea
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter organizational cluster description"
                disabled={isLoading}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-600">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleBackOrCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-green-700">
          {mode === 'create'
            ? 'Submit Organizational Cluster'
            : 'Update Organizational Cluster'}
        </Button>
      </div>
    </form>
  )
}
