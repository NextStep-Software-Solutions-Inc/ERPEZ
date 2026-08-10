import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FieldProps<T> {
  state: {
    value: T
    meta: {
      errors: Array<{ message?: string }>
    }
  }
  handleChange: (value: T) => void
}

interface FormFieldsProps {
  activityNameField: FieldProps<string>
  indicatorField: FieldProps<string>
  weightField: FieldProps<number>
}

export function FormFields({ activityNameField, indicatorField, weightField }: FormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-bold text-gray-700">Activity *</Label>
        <Input
          placeholder="Enter Target Activity"
          className="border-gray-200"
          value={activityNameField.state.value}
          onChange={(e) => activityNameField.handleChange(e.target.value)}
        />
        {activityNameField.state.meta.errors.length > 0 && (
          <p className="text-red-500 text-xs">{activityNameField.state.meta.errors[0]?.message}</p>
        )}
      </div>

      <div>
        <Label className="text-sm font-bold text-gray-700">Target Accomplishment *</Label>
        <Input
          placeholder="Enter Target Accomplishment"
          className="border-gray-200"
          value={indicatorField.state.value}
          onChange={(e) => indicatorField.handleChange(e.target.value)}
        />
        {indicatorField.state.meta.errors.length > 0 && (
          <p className="text-red-500 text-xs">{indicatorField.state.meta.errors[0]?.message}</p>
        )}
      </div>

      <div>
        <Label className="text-sm font-bold text-gray-700">Weight (%)</Label>
        <Input
          type="number"
          placeholder="Enter weight"
          className="border-gray-200"
          value={weightField.state.value}
          onChange={(e) => weightField.handleChange(parseFloat(e.target.value) || 0)}
        />
        {weightField.state.meta.errors.length > 0 && (
          <p className="text-red-500 text-xs">{weightField.state.meta.errors[0]?.message}</p>
        )}
      </div>
    </div>
  )
}