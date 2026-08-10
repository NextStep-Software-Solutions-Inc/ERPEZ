import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FieldInfo from '@/components/FieldInfo'
import { Button } from '@/components/ui/button'

const addExpTypeSchema = z.object({
  allotmentClass: z.enum(['PS', 'MOOE', 'CO']),
})

export type AddExpTypeFormValues = z.infer<typeof addExpTypeSchema>

interface AddExpTypeFormProps {
  availableOptions: Array<{ value: 'PS' | 'MOOE' | 'CO'; label: string }>
  onSubmit: (values: AddExpTypeFormValues) => void
  onCancel: () => void
}

export function AddExpTypeForm({
  availableOptions,
  onSubmit,
  onCancel,
}: AddExpTypeFormProps) {
  const form = useForm({
    defaultValues: {
      allotmentClass: (availableOptions[0]?.value || 'MOOE') as 'PS' | 'MOOE' | 'CO',
    },
    validators: {
      onChange: addExpTypeSchema,
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
        name="allotmentClass"
        children={(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="font-semibold text-slate-700">
              Select Allotment Class *
            </Label>
            <Select
              value={field.state.value}
              onValueChange={(val: 'PS' | 'MOOE' | 'CO') => field.handleChange(val)}
            >
              <SelectTrigger id={field.name} className="text-xs">
                <SelectValue placeholder="Select allotment class..." />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          disabled={availableOptions.length === 0}
        >
          Add Type
        </Button>
      </div>
    </form>
  )
}
