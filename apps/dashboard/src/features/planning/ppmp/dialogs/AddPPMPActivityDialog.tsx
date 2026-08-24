import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { useQueryClient } from '@tanstack/react-query'
import FieldInfo from '@/components/FieldInfo'
import { toast } from 'sonner'

import { getLIBActivitiesRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/getLIBActivitiesRequest'
import { createPPMPActivityRequest } from '@/features/planning/ppmp/handlers/createPPMPActivityRequest'
import { getPPMPActivitiesRequest } from '@/features/planning/ppmp/handlers/getPPMPActivitiesRequest'
import SubmitButton from '@/components/SubmitButton'

const useCreatePPMPActivity = createMutationHookFromTemplate(
  createPPMPActivityRequest,
)

const useLIBActivities = createQueryHookFromTemplate(getLIBActivitiesRequest)
const usePPMPActivities = createQueryHookFromTemplate(getPPMPActivitiesRequest)

const createPpmpActivitySchema = z.object({
  libActivityId: z.string().min(1, 'Select activity'),
})

export type AddPPMPActivityFormValues = z.infer<typeof createPpmpActivitySchema>

interface AddPPMPActivityDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  ppmpId: string
  libId?: string
  existingLibActivityIds?: string[]
  onCreated?: () => void
}

export default function AddPPMPActivityDialog({
  isOpen,
  onOpenChange,
  ppmpId,
  libId,
  existingLibActivityIds,
  onCreated,
}: AddPPMPActivityDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreatePPMPActivity()

  const { data: libActivitiesResp, isLoading: isLibActsLoading } =
    useLIBActivities({
      pathParams: {},
      queryParams: libId ? { filters: `lineItemBudgetId==${libId}`, pageSize: 1000 } : {},
      enabled: !!libId && isOpen,
    })

  const { data: existingPpmpActsResp } = usePPMPActivities({
    pathParams: {},
    queryParams: {
      filters: `ppmpId==${ppmpId}`,
      pageSize: 1000,
    },
    enabled: !existingLibActivityIds && !!ppmpId && isOpen,
  })

  const libActivities = libActivitiesResp?.data ?? []

  const availableLibActivities = (function () {
    const existingIds =
      existingLibActivityIds ??
      (existingPpmpActsResp?.data ?? [])
        .filter((a: any) => a.libActivityId)
        .map((a: any) => a.libActivityId)

    const existingSet = new Set(existingIds)
    return libActivities.filter((a: any) => !existingSet.has(a.id))
  })()

  const form = useForm({
    defaultValues: { libActivityId: '' } as z.input<
      typeof createPpmpActivitySchema
    >,
    validators: { onChange: createPpmpActivitySchema },
    onSubmit: async ({ value }) => {
      try {
        await toast.promise(
          mutateAsync(
            {
              pathParams: {},
              payload: {
                ppmpId,
                libActivityId: value.libActivityId,
              },
            },
            {
              onSuccess: () => {
                void queryClient.invalidateQueries({
                  predicate: (query) =>
                    typeof query.queryKey[0] === 'string' &&
                    (query.queryKey[0].startsWith('/ppmp-activities') ||
                      query.queryKey[0].startsWith('/ppmp')),
                })
                onCreated?.()
                onOpenChange(false)
              },
            },
          ),
          {
            loading: 'Adding activity to PPMP...',
            success: 'Activity added successfully',
            error: (err) =>
              err instanceof Error ? err.message : 'Failed to add activity',
          },
        )
      } catch {
        // toast.promise handles the presentation
      }
    },
  })

  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen, form])

  return (
    <ResponsiveDialogDashtail
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Add PPMP Activity"
      description="Select a LIB activity to add to this PPMP"
      size="md"
      trigger={null}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="btn btn-outline"
          >
            Cancel
          </button>

          {form && (
            <form.Subscribe
              selector={(s) => [s.canSubmit, s.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <SubmitButton
                  onClick={() => form.handleSubmit()}
                  loading={isSubmitting}
                  disabled={!canSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? 'Adding...' : 'Add Activity'}
                </SubmitButton>
              )}
            />
          )}
        </div>
      }
    >
      <div className="p-3">
        <form
          id="add-ppmp-activity-form"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="libActivityId"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>LIB Activity</Label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  disabled={
                    isLibActsLoading ||
                    isPending ||
                    availableLibActivities.length === 0
                  }
                >
                  <SelectTrigger id={field.name} className="w-full text-left">
                    <SelectValue
                      placeholder={
                        isLibActsLoading
                          ? 'Loading activities...'
                          : availableLibActivities.length === 0
                            ? 'All LIB activities have already been added'
                            : 'Select activity'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLibActivities.map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name || a.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </div>
            )}
          />
        </form>
      </div>
    </ResponsiveDialogDashtail>
  )
}
