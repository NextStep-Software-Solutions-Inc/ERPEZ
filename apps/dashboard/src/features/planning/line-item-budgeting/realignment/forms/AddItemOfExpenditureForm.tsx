import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import FieldInfo from '@/components/FieldInfo'
import { Button } from '@/components/ui/button'

const addItemOfExpenditureSchema = z.object({
  itemSelect: z.string().min(1, 'Please select an item or choose custom'),
  customName: z.string().optional(),
}).refine((data) => {
  if (data.itemSelect === 'custom') {
    return !!data.customName?.trim()
  }
  return true
}, {
  message: 'Custom item name is required when custom is selected',
  path: ['customName'],
})

export type AddItemOfExpenditureFormValues = z.infer<typeof addItemOfExpenditureSchema>

interface AddItemOfExpenditureFormProps {
  standardOptions: string[]
  onSubmit: (name: string) => void
  onCancel: () => void
}

export function AddItemOfExpenditureForm({
  standardOptions,
  onSubmit,
  onCancel,
}: AddItemOfExpenditureFormProps) {
  const form = useForm({
    defaultValues: {
      itemSelect: standardOptions[0] || 'custom',
      customName: '',
    },
    validators: {
      onChange: addItemOfExpenditureSchema,
    },
    onSubmit: async ({ value }) => {
      const finalName = value.itemSelect === 'custom' ? value.customName! : value.itemSelect
      onSubmit(finalName)
    },
  })

  // Watch itemSelect changes to toggle custom name input field visibility
  const itemSelectValue = form.useStore((state) => state.values.itemSelect)
  const isCustom = itemSelectValue === 'custom'

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
        name="itemSelect"
        children={(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="font-semibold text-slate-700">
              Standard Expenditure Item
            </Label>
            <Select
              value={field.state.value}
              onValueChange={(val) => {
                field.handleChange(val)
                if (val !== 'custom') {
                  form.setFieldValue('customName', '')
                }
              }}
            >
              <SelectTrigger id={field.name} className="text-xs">
                <SelectValue placeholder="Select item..." />
              </SelectTrigger>
              <SelectContent>
                {standardOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom (Write-in)...</SelectItem>
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      />

      {isCustom && (
        <form.Field
          name="customName"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="font-semibold text-slate-700">
                Custom Item Name *
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. Project audit services"
                className="text-xs h-9"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      )}

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
