import { useMemo, useEffect } from 'react'
import { useForm, useField } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import FieldInfo from '@/components/FieldInfo'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { createLIBActivityRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/createLIBActivityRequest'
import type { WFPObjectiveActivity } from '@/features/planning/wfp/types/type.wfp'
import { WFPDetails } from '@/components/features/planning/wfp'

const useCreateLIBActivity2 = createMutationHookFromTemplate(
  createLIBActivityRequest,
)

const createCreateLIBActivityWfpactFormSchema = z.object({
  wfpObjectiveActivityId: z.string().min(1, 'WFP Activity is required'),
  name: z.string().optional(),
})

export type CreateLIBActivityFormValues = z.infer<
  typeof createCreateLIBActivityWfpactFormSchema
>
interface CreateCreateLIBActivityWfpactFormFormProps {
  libId: string
  wfpData?: WFPDetails
  isWFPLoading?: boolean
  onCreated?: () => void
  onClose?: () => void
  setForm?: (form: ReturnType<typeof useForm>) => void
  type?: string
  onSubmitOverride?: (value: any) => void
}

export default function CreateLIBActivityWfpactForm({
  libId,
  wfpData,
  isWFPLoading = false,
  onCreated,
  onClose,
  setForm,
  onSubmitOverride,
}: CreateCreateLIBActivityWfpactFormFormProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateLIBActivity2()

  // Extract activities from wfpData
  const wfpActivities = useMemo(() => {
    const activities: WFPObjectiveActivity[] = []
    if (wfpData?.wfpObjectives) {
      wfpData.wfpObjectives.forEach((objective) => {
        if (objective.wfpObjectiveActivities) {
          activities.push(...objective.wfpObjectiveActivities)
        }
      })
    }
    return activities
  }, [wfpData])

  const form = useForm({
    defaultValues: {
      wfpObjectiveActivityId: '',
      name: '',
    } as z.input<typeof createCreateLIBActivityWfpactFormSchema>,
    validators: {
      onChange: createCreateLIBActivityWfpactFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const selectedActivity = wfpActivities.find(
          (a) => a.id === value.wfpObjectiveActivityId,
        )
        const name = value.name || selectedActivity?.activityName || ''

        if (onSubmitOverride) {
          onSubmitOverride({
            lineItemBudgetId: libId,
            wfpObjectiveActivityId: value.wfpObjectiveActivityId,
            name,
          })
          onCreated?.()
          onClose?.()
          return
        }

        await mutateAsync(
          {
            pathParams: {},
            payload: {
              lineItemBudgetId: libId,
              wfpObjectiveActivityId: value.wfpObjectiveActivityId,
              name,
            },
          },
          {
            onSuccess: async () => {
              toast.success('LIB Activity added successfully!')
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].startsWith('/lib-activities'),
              })
            },
          },
        )

        onCreated?.()
        onClose?.()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to add LIB Activity'
        toast.error(message)
      }
    },
  })

  // Expose form to parent
  useEffect(() => {
    if (setForm) {
      setForm(form as unknown as ReturnType<typeof useForm>)
    }
  }, [form, setForm])

  // Watch activity selection to auto-populate name
  const wfpObjectiveActivityId = useField({
    form,
    name: 'wfpObjectiveActivityId',
  }).state.value
  useEffect(() => {
    if (wfpObjectiveActivityId) {
      const selectedActivity = wfpActivities.find(
        (a) => a.id === wfpObjectiveActivityId,
      )
      if (selectedActivity && !form.state.values.name) {
        form.setFieldValue('name', selectedActivity.activityName)
      }
    }
  }, [wfpObjectiveActivityId, wfpActivities, form])

  return (
    <form
      id="create-lib-activity-form"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      {/* WFP Objective Activity Field */}
      <form.Field
        name="wfpObjectiveActivityId"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{'WFP Activity'}</Label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
              disabled={isWFPLoading || isPending || wfpActivities.length === 0}
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue
                  placeholder={
                    isWFPLoading
                      ? 'Loading activities...'
                      : wfpActivities.length === 0
                        ? 'No activities available'
                        : 'Select WFP Activity'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {wfpActivities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.activityName || `WFP Activity ${activity.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      />
      {/* Name Field (Auto-populated, editable) */}
      <form.Field
        name="name"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{'WFP Activity Name (Optional)'}</Label>
            <Input
              id={field.name}
              value={field.state.value === undefined ? '' : field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Auto-populated from selected activity"
              disabled={isPending}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />
    </form>
  )
}
