import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import FieldInfo from '@/components/FieldInfo'
import type { LIBActivity } from '@/features/planning/line-item-budgeting/line-item-budget/types'

const updateLIBActivitySchema = z.object({
  name: z.string().min(1, 'Activity name is required'),
  lineItemBudgetId: z.string(),
  wfpObjectiveActivityId: z.string().optional(),
  opcrActivityId: z.string().optional(),
})

export type UpdateLIBActivityFormValues = z.infer<
  typeof updateLIBActivitySchema
>

interface ActivityDefaults {
  name: string
  lineItemBudgetId: string
  wfpObjectiveActivityId?: string
  opcrActivityId?: string
}

// Helper to extract the form type
const useUpdateLIBActivityFormInstance = (
  defaultValues: ActivityDefaults,
  onActivityUpdated: (activity: UpdateLIBActivityFormValues) => void,
) =>
  useForm({
    defaultValues,
    validators: {
      onChange: updateLIBActivitySchema,
    },
    onSubmit: async ({ value }) => {
      onActivityUpdated(value)
    },
  })

export type UpdateLIBActivityFormApi = ReturnType<
  typeof useUpdateLIBActivityFormInstance
>

interface UpdateLIBActivityFormProps {
  activity: LIBActivity
  onActivityUpdated: (activity: UpdateLIBActivityFormValues) => void
  onClose?: () => void
  setForm?: (form: UpdateLIBActivityFormApi) => void
}

export default function UpdateLIBActivityForm({
  activity,
  onActivityUpdated,
  setForm,
}: UpdateLIBActivityFormProps) {
  const activityDefaults: ActivityDefaults = {
    name: activity?.name || '',
    lineItemBudgetId: activity?.lineItemBudgetId || '',
    wfpObjectiveActivityId: activity?.wfpObjectiveActivityId,
    opcrActivityId: activity?.opcrActivityId,
  }

  const form = useUpdateLIBActivityFormInstance(
    activityDefaults,
    onActivityUpdated,
  )

  // Expose form to parent on creation via effect
  useEffect(() => {
    setForm?.(form)
  }, [form, setForm])

  return (
    <form
      id="update-lib-activity-form"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      {/* Activity Name Field */}
      <form.Field
        name="name"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Activity Name</Label>
            <Input
              id={field.name}
              placeholder="Enter activity name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />
    </form>
  )
}
