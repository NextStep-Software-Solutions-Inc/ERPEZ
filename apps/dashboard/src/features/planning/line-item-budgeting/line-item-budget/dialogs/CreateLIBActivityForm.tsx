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
import type { OPCRActivity } from '@/lib/opcr'
import { OPCRDetails } from '@/features/planning/opcr'

const useCreateLIBActivity = createMutationHookFromTemplate(
  createLIBActivityRequest,
)

const createLIBActivitySchema = z.object({
  opcrActivityId: z.string().min(1, 'OPCR Activity is required'),
  name: z.string().optional(),
})

export type CreateLIBActivityFormValues = z.infer<
  typeof createLIBActivitySchema
>
interface CreateLIBActivityFormProps {
  libId: string
  opcrData?: OPCRDetails
  isOPCRLoading?: boolean
  onCreated?: () => void
  onClose?: () => void
  setForm?: (form: ReturnType<typeof useForm>) => void
  type?: string
  onSubmitOverride?: (value: any) => void
}

export default function CreateLIBActivityForm({
  libId,
  opcrData,
  isOPCRLoading = false,
  onCreated,
  onClose,
  setForm,
  type,
  onSubmitOverride,
}: CreateLIBActivityFormProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateLIBActivity()

  // Extract activities from opcrData
  const opcrActivities = useMemo(() => {
    const activities: OPCRActivity[] = []
    if (opcrData?.opcrItems) {
      opcrData.opcrItems.forEach((item) => {
        if (item.opcrActivities) {
          activities.push(...item.opcrActivities)
        }
      })
    }
    return activities
  }, [opcrData])

  const form = useForm({
    defaultValues: {
      opcrActivityId: '',
      name: '',
    } as z.input<typeof createLIBActivitySchema>,
    validators: {
      onChange: createLIBActivitySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const selectedActivity = opcrActivities.find(
          (a) => a.id === value.opcrActivityId,
        )
        const name = value.name || selectedActivity?.name || ''

        if (onSubmitOverride) {
          onSubmitOverride({
            lineItemBudgetId: libId,
            opcrActivityId: value.opcrActivityId,
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
              opcrActivityId: value.opcrActivityId,
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
  const opcrActivityId = useField({ form, name: 'opcrActivityId' }).state.value
  useEffect(() => {
    if (opcrActivityId) {
      const selectedActivity = opcrActivities.find(
        (a) => a.id === opcrActivityId,
      )
      if (selectedActivity && !form.state.values.name) {
        form.setFieldValue('name', selectedActivity.name)
      }
    }
  }, [opcrActivityId, opcrActivities, form])

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
      {/* OPCR Activity Field */}
      <form.Field
        name="opcrActivityId"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {type === 'OPCR' ? 'OPCR Activity' : 'WFP Activity'}
            </Label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
              disabled={
                isOPCRLoading || isPending || opcrActivities.length === 0
              }
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue
                  placeholder={
                    isOPCRLoading
                      ? 'Loading activities...'
                      : opcrActivities.length === 0
                        ? 'No activities available'
                        : type === 'OPCR'
                          ? 'Select OPCR Activity'
                          : 'Select WFP Activity'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {opcrActivities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.name ||
                      `${type === 'OPCR' ? 'OPCR' : 'WFP'} Activity ${activity.id}`}
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
            <Label htmlFor={field.name}>
              {'OPCR Activity Name (Optional)'}
            </Label>
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
