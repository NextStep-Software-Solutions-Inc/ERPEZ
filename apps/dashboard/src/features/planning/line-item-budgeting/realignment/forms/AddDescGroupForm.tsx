import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import FieldInfo from '@/components/FieldInfo'
import { Button } from '@/components/ui/button'

const addDescGroupSchema = z.object({
  description: z.string().min(1, 'Category description name is required'),
})

export type AddDescGroupFormValues = z.infer<typeof addDescGroupSchema>

interface AddDescGroupFormProps {
  onSubmit: (values: AddDescGroupFormValues) => void
  onCancel: () => void
}

export function AddDescGroupForm({
  onSubmit,
  onCancel,
}: AddDescGroupFormProps) {
  const form = useForm({
    defaultValues: {
      description: '',
    },
    validators: {
      onChange: addDescGroupSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4 text-xs"
    >
      <form.Field
        name="description"
        children={(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="font-semibold text-slate-700">
              Category Description Name *
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. Seminar logistics"
              className="text-xs h-9"
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="text-xs h-9"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white text-xs h-9"
        >
          Add Category
        </Button>
      </div>
    </form>
  )
}
