import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FieldInfo from '@/components/FieldInfo'
import { Button } from '@/components/ui/button'

const addProjectItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  qty: z.number().nonnegative('Quantity must be positive or zero'),
  unitCost: z.number().nonnegative('Unit cost must be positive or zero'),
  timelineType: z.enum(['ONGOING', 'PERIOD']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type AddProjectItemFormValues = z.infer<typeof addProjectItemSchema>

interface AddProjectItemFormProps {
  onSubmit: (values: AddProjectItemFormValues) => void
  onCancel: () => void
}

export function AddProjectItemForm({
  onSubmit,
  onCancel,
}: AddProjectItemFormProps) {
  const form = useForm({
    defaultValues: {
      description: '',
      qty: 0,
      unitCost: 0,
      timelineType: 'ONGOING' as 'ONGOING' | 'PERIOD',
      startDate: '',
      endDate: '',
    },
    validators: {
      onChange: addProjectItemSchema,
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
              Item Description *
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. Travel tickets to Manila"
              className="text-xs h-9"
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <form.Field
          name="qty"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="font-semibold text-slate-700">
                Quantity
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
          name="unitCost"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="font-semibold text-slate-700">
                Unit Cost (₱)
              </Label>
              <Input
                id={field.name}
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
                placeholder="0.00"
                className="text-xs h-9"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 items-end">
        <form.Field
          name="timelineType"
          children={(field) => (
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700">Timeline Type</Label>
              <Select
                value={field.state.value}
                onValueChange={(val: 'ONGOING' | 'PERIOD') => field.handleChange(val)}
              >
                <SelectTrigger id={field.name} className="text-xs">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONGOING">ONGOING</SelectItem>
                  <SelectItem value="PERIOD">PERIOD</SelectItem>
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </div>
          )}
        />

        <form.Field
          name="startDate"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="font-semibold text-slate-700">
                Start Date
              </Label>
              <Input
                id={field.name}
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="text-xs h-9"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        <form.Field
          name="endDate"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="font-semibold text-slate-700">
                End Date
              </Label>
              <Input
                id={field.name}
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
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
          Add Item
        </Button>
      </div>
    </form>
  )
}
