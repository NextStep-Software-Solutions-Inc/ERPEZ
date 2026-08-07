import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import FieldInfo from '@/components/FieldInfo'
import { STANDARD_ITEMS } from '../constants/realignmentConstants'
import { Button } from '@/components/ui/button'

const addObjectGroupSchema = z.object({
  allotmentClass: z.enum(['PS', 'MOOE', 'CO']),
  itemSelect: z.string().min(1, 'Item select is required'),
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

export type AddObjectGroupFormValues = z.infer<typeof addObjectGroupSchema>

interface AddObjectGroupFormProps {
  onSubmit: (values: AddObjectGroupFormValues) => void
  onCancel: () => void
}

export function AddObjectGroupForm({
  onSubmit,
  onCancel,
}: AddObjectGroupFormProps) {
  const form = useForm({
    defaultValues: {
      allotmentClass: 'PS' as 'PS' | 'MOOE' | 'CO',
      itemSelect: '',
      customName: '',
    },
    validators: {
      onChange: addObjectGroupSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value)
    },
  })

  // Watch allotmentClass to list standard items reactively
  const allotmentClass = form.useStore((state) => state.values.allotmentClass)
  const itemSelect = form.useStore((state) => state.values.itemSelect)

  const standardItems = STANDARD_ITEMS[allotmentClass] || []

  // Update itemSelect defaults if allotmentClass changes
  const handleAllotmentClassChange = (val: 'PS' | 'MOOE' | 'CO') => {
    form.setFieldValue('allotmentClass', val)
    const items = STANDARD_ITEMS[val] || []
    if (items.length > 0) {
      form.setFieldValue('itemSelect', items[0])
    } else {
      form.setFieldValue('itemSelect', 'custom')
    }
    form.setFieldValue('customName', '')
  }

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
              Allotment Class *
            </Label>
            <Select
              value={field.state.value}
              onValueChange={handleAllotmentClassChange}
            >
              <SelectTrigger id={field.name} className="text-xs">
                <SelectValue placeholder="Select allotment class..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PS">Personnel Services (PS)</SelectItem>
                <SelectItem value="MOOE">Maintenance & Other Operating Expenses (MOOE)</SelectItem>
                <SelectItem value="CO">Capital Outlay (CO)</SelectItem>
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      />

      <form.Field
        name="itemSelect"
        children={(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="font-semibold text-slate-700">
              Standard Expenditure Item *
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
                {standardItems.map((opt) => (
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

      {itemSelect === 'custom' && (
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
