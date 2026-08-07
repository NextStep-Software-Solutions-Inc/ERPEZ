import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import FieldInfo from '@/components/FieldInfo'
import { Button } from '@/components/ui/button'

const addBudgetItemSchema = z.object({
  description: z.string().min(1, 'Sub-item description is required'),
  q1: z.number().nonnegative('Must be positive or zero'),
  q2: z.number().nonnegative('Must be positive or zero'),
  q3: z.number().nonnegative('Must be positive or zero'),
  q4: z.number().nonnegative('Must be positive or zero'),
})

export type AddBudgetItemFormValues = z.infer<typeof addBudgetItemSchema>

interface AddBudgetItemFormProps {
  onSubmit: (values: AddBudgetItemFormValues) => void
  onCancel: () => void
}

export function AddBudgetItemForm({
  onSubmit,
  onCancel,
}: AddBudgetItemFormProps) {
  const form = useForm({
    defaultValues: {
      description: '',
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
    },
    validators: {
      onChange: addBudgetItemSchema,
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
              Sub-Item Description *
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. Office laptop procurement Q1"
              className="text-xs h-9"
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <form.Field
          name="q1"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="font-semibold text-slate-700">
                Q1 Budget
              </Label>
              <Input
                id={field.name}
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
                placeholder="0"
                className="text-xs h-9"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        <form.Field
          name="q2"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="font-semibold text-slate-700">
                Q2 Budget
              </Label>
              <Input
                id={field.name}
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
                placeholder="0"
                className="text-xs h-9"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        <form.Field
          name="q3"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="font-semibold text-slate-700">
                Q3 Budget
              </Label>
              <Input
                id={field.name}
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
                placeholder="0"
                className="text-xs h-9"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        <form.Field
          name="q4"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="font-semibold text-slate-700">
                Q4 Budget
              </Label>
              <Input
                id={field.name}
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
                placeholder="0"
                className="text-xs h-9"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      </div>

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
          Add Sub-Item
        </Button>
      </div>
    </form>
  )
}
