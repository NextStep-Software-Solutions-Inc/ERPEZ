import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export const updateWFPObjectiveSchema = z.object({
  wfpId: z.string().min(1, 'WFP ID is required'),
  description: z.string().min(1, 'Objective description is required'),
  weight: z.number().min(1, 'Weight must be at least 1').max(100, 'Weight cannot exceed 100'),
  outcome: z.string().optional().default(''),
});

export type UpdateWFPObjectiveValues = z.infer<typeof updateWFPObjectiveSchema>

interface UpdateWFPObjectiveFormProps {
  onSubmit: (data: UpdateWFPObjectiveValues) => void
  onCancel: () => void
  isLoading?: boolean
  wfpId: string
  initialValues: Partial<UpdateWFPObjectiveValues>
}

export default function UpdateWFPObjectiveForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false,
  wfpId,
  initialValues
}: UpdateWFPObjectiveFormProps) {
  const form = useForm({
    defaultValues: {
      wfpId: wfpId,
      description: initialValues.description || '',
      weight: initialValues.weight || 0,
      outcome: initialValues.outcome || '',
    } as UpdateWFPObjectiveValues,
    onSubmit: (values) => {
      onSubmit({ ...values.value, wfpId })
    },
  })

  useEffect(() => {
    if (initialValues.description || initialValues.weight || initialValues.outcome) {
      form.reset({
        wfpId: wfpId,
        description: initialValues.description || '',
        weight: initialValues.weight || 0,
        outcome: initialValues.outcome || '',
      } as UpdateWFPObjectiveValues)
    }
  }, [initialValues, wfpId, form])

  const isSubmitting = isLoading || form.state.isSubmitting

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6 pt-2 max-w-2xl mx-auto"
    >
      {/* Objective Description */}
      <form.Field
        name="description"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="text-gray-700 font-medium">
              Objective <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id={field.name}
              placeholder="Enter Specific Objective"
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={field.state.meta.errors.length > 0 ? 'border-red-500' : 'border-gray-300'}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-red-500 font-medium">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      />

      {/* Expected Outcome */}
      <form.Field
        name="outcome"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="text-gray-700 font-medium">
              Expected Outcome
            </Label>
            <Textarea
              id={field.name}
              placeholder="What is the expected result?"
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border-gray-300"
            />
          </div>
        )}
      />

      {/* Weight Field */}
      <form.Field
        name="weight"
        children={(field) => (
          <div className="grid gap-2 w-full sm:w-1/2">
            <Label htmlFor={field.name} className="text-gray-700 font-medium">
              Weight (%) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id={field.name}
                type="number"
                placeholder="e.g. 25"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className={field.state.meta.errors.length > 0 ? 'border-red-500 pr-8' : 'border-gray-300 pr-8'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-red-500 font-medium">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-8 border-gray-300 text-gray-600"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#10b981] hover:bg-[#059669] text-white px-8"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Update Objective
        </Button>
      </div>
    </form>
  )
}