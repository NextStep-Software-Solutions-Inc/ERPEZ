import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FieldInfo from '@/components/FieldInfo'
import { Button } from '@/components/ui/button'

const addActivitySchema = z.object({
  source: z.enum(['activity', 'opcr']),
})

export type AddActivityFormValues = z.infer<typeof addActivitySchema>

interface AddActivityFormProps {
  showSourceSelect: boolean
  generatedName: string
  onSubmit: (values: AddActivityFormValues) => void
  onCancel: () => void
}

export function AddActivityForm({
  showSourceSelect,
  generatedName,
  onSubmit,
  onCancel,
}: AddActivityFormProps) {
  const form = useForm({
    defaultValues: {
      source: 'activity' as 'activity' | 'opcr',
    },
    validators: {
      onChange: addActivitySchema,
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
      {showSourceSelect && (
        <form.Field
          name="source"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="font-semibold text-slate-700">
                Source Level *
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(val: 'activity' | 'opcr') => field.handleChange(val)}
              >
                <SelectTrigger id={field.name} className="text-xs">
                  <SelectValue placeholder="Select source level..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activity">WFP - activity level</SelectItem>
                  <SelectItem value="opcr">OPCR Level</SelectItem>
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </div>
          )}
        />
      )}

      <div className="space-y-1.5">
        <Label className="font-semibold text-slate-700">
          Activity Name (Auto-generated)
        </Label>
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-slate-700">
          {generatedName}
        </div>
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
          Add Activity
        </Button>
      </div>
    </form>
  )
}
