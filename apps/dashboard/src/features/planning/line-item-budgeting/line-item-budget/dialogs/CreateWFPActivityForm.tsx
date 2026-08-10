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
import { WFPDetails } from '@/components/features/planning/wfp/wfp/table/types'
import { WFPObjectiveActivity } from '@/features/planning/wfp/types/type.wfp'

const useCreateLIBActivity = createMutationHookFromTemplate(
  createLIBActivityRequest,
)

const createWFPActivitySchema = z.object({
  wfpActivityId: z.string().min(1, 'WFP Activity is required'),
  name: z.string().optional(),
})

export type CreateWFPActivityFormValues = z.infer<
  typeof createWFPActivitySchema
>

interface CreateWFPActivityFormProps {
  libId: string
  wfpData?: WFPDetails
  isWFPLoading?: boolean
  onCreated?: () => void
  onClose?: () => void
  setForm?: (form: ReturnType<typeof useForm>) => void
}

export default function CreateWFPActivityForm({
  libId,
  wfpData,
  isWFPLoading = false,
  onCreated,
  onClose,
  setForm,
}: CreateWFPActivityFormProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateLIBActivity()

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
      wfpActivityId: '',
      name: '',
    } as z.input<typeof createWFPActivitySchema>,
    validators: {
      onChange: createWFPActivitySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const selectedActivity = wfpActivities.find(
          (a) => a.id === value.wfpActivityId,
        )

        await mutateAsync(
          {
            pathParams: {},
            payload: {
              lineItemBudgetId: libId,
              wfpObjectiveActivityId: value.wfpActivityId,
              name: value.name || selectedActivity?.activityName,
            },
          },
          {
            onSuccess: async () => {
              toast.success('WFP Activity added successfully!')
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
          err instanceof Error ? err.message : 'Failed to add WFP Activity'
        toast.error(message)
      }
    },
  })

  useEffect(() => {
    if (setForm) {
      setForm(form as unknown as ReturnType<typeof useForm>)
    }
  }, [form, setForm])

  const wfpActivityId = useField({ form, name: 'wfpActivityId' }).state.value
  useEffect(() => {
    if (wfpActivityId) {
      const selectedActivity = wfpActivities.find((a) => a.id === wfpActivityId)
      if (selectedActivity && !form.state.values.name) {
        form.setFieldValue('name', selectedActivity.activityName)
      }
    }
  }, [wfpActivityId, wfpActivities, form])

  return (
    <form
      id="create-wfp-activity-form"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      <form.Field
        name="wfpActivityId"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>WFP Activity</Label>
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
      <form.Field
        name="name"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>WFP Activity Name (Optional)</Label>
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
