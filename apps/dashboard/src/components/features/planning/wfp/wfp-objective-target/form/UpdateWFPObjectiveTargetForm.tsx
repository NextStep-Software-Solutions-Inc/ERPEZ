import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { updateFormDataAtom } from '../atoms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const updateWFPObjectiveSchema = z.object({
  wfpObjectiveId: z.string().min(1, 'WFP Objective ID is required'),
  activityName: z.string().min(1, 'Activity name is required'),
  weight: z.number().min(0.01).max(100, 'Weight must be between 0 and 100'),
  indicator: z.string().min(1, 'Indicator is required'),
});

export type UpdateWFPObjectiveTargetValues = z.infer<typeof updateWFPObjectiveSchema>

interface UpdateWFPObjectiveTargetFormProps {
  onSubmit: (data: UpdateWFPObjectiveTargetValues) => void
  onCancel: () => void
  isLoading?: boolean
  wfpObjectiveId: string
  initialValues: Partial<UpdateWFPObjectiveTargetValues>
}

export default function UpdateWFPObjectiveTargetForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false,
  wfpObjectiveId,
  initialValues
}: UpdateWFPObjectiveTargetFormProps) {
  const [formData, setFormData] = useAtom(updateFormDataAtom)
  
  const form = useForm({
    defaultValues: {
      wfpObjectiveId,
      activityName: formData.activityName || initialValues.activityName || '',
      indicator: formData.indicator || initialValues.indicator || '',
      weight: formData.weight ?? initialValues.weight ?? 0,
    } as UpdateWFPObjectiveTargetValues,
    validators: {
      onChange: updateWFPObjectiveSchema,
    },
    onSubmit: ({ value }) => {
      // Explicitly pick properties to avoid passing legacy data
      const payload: UpdateWFPObjectiveTargetValues = {
        wfpObjectiveId: value.wfpObjectiveId,
        activityName: value.activityName,
        indicator: value.indicator,
        weight: value.weight,
      }
      onSubmit(payload)
      setFormData({})
    },
  })

  // Sync form with initialValues when they change (e.g. after API fetch)
  useEffect(() => {
    if (initialValues.activityName || initialValues.indicator || initialValues.weight) {
      form.reset({
        wfpObjectiveId,
        activityName: formData.activityName || initialValues.activityName || '',
        indicator: formData.indicator || initialValues.indicator || '',
        weight: formData.weight ?? initialValues.weight ?? 0,
      } as UpdateWFPObjectiveTargetValues)
    }
  }, [initialValues, wfpObjectiveId, formData, form])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="relative pl-6 space-y-6 pt-2 max-w-2xl mx-auto"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-full" />

      {/* Activity Name */}
      <form.Field
        name="activityName"
        validators={{
          onChange: z.string().min(1, 'Activity name is required'),
        }}
        children={(field) => (
          <div className="space-y-1">
            <Label className="text-sm font-bold text-gray-700">
              Activity <span className="text-red-500">*</span>
            </Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border-gray-200"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-red-500 text-xs">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Expected Indicator */}
      <form.Field
        name="indicator"
        validators={{
          onChange: z.string().min(1, 'Indicator is required'),
        }}
        children={(field) => (
          <div className="space-y-1">
            <Label className="text-sm font-bold text-gray-700">
              Target Accomplishment <span className="text-red-500">*</span>
            </Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border-gray-200"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-red-500 text-xs">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Weight */}
      <form.Field
        name="weight"
        validators={{
          onChange: z
            .number()
            .min(0.01, 'Weight must be at least 0.01')
            .max(100, 'Weight must be between 0 and 100'),
        }}
        children={(field) => (
          <div className="space-y-1">
            <Label className="text-sm font-bold text-gray-700">
              Weight (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={field.state.value || ''}
              onChange={(e) => {
                const val = e.target.value
                field.handleChange(val === '' ? 0 : parseFloat(val) || 0)
              }}
              className="border-gray-200"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-red-500 text-xs">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      />


      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={() => {
            setFormData({})
            onCancel()
          }} 
          className="px-10"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 font-bold"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : 'Update Activity'}
        </Button>
      </div>
    </form>
  )
}