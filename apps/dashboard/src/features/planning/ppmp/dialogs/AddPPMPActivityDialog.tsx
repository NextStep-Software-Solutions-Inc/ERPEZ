import { useEffect, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Lock } from 'lucide-react'
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

  const { data: allPpmpActsResp } = usePPMPActivities({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
    },
    enabled: isOpen,
  })

  const libActivities = libActivitiesResp?.data ?? []

  const { availableActivities, otherAssignedActivities } = useMemo(() => {
    const currentPpmpExistingSet = new Set(
      existingLibActivityIds ??
        (existingPpmpActsResp?.data ?? [])
          .filter((a: any) => a.ppmpId === ppmpId && a.libActivityId)
          .map((a: any) => a.libActivityId),
    )

    const otherPpmpActivitySet = new Set(
      (allPpmpActsResp?.data ?? [])
        .filter((a: any) => a.ppmpId !== ppmpId && a.libActivityId)
        .map((a: any) => a.libActivityId),
    )

    // Filter out activities already in THIS ppmp
    const remaining = libActivities.filter(
      (a: any) => !currentPpmpExistingSet.has(a.id),
    )

    const available: any[] = []
    const otherAssigned: any[] = []

    for (const a of remaining) {
      if (otherPpmpActivitySet.has(a.id)) {
        otherAssigned.push(a)
      } else {
        available.push(a)
      }
    }

    return { availableActivities: available, otherAssignedActivities: otherAssigned }
  }, [
    libActivities,
    existingLibActivityIds,
    existingPpmpActsResp?.data,
    allPpmpActsResp?.data,
    ppmpId,
  ])

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
      <div className="p-1 text-left">
        <form
          id="add-ppmp-activity-form"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4 text-left"
        >
          <form.Field
            name="libActivityId"
            children={(field) => (
              <div className="space-y-2 text-left">
                <Label htmlFor={field.name} className="text-left block text-xs font-semibold text-slate-700">
                  LIB Activity
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  disabled={
                    isLibActsLoading ||
                    isPending ||
                    availableActivities.length === 0
                  }
                >
                  <SelectTrigger id={field.name} className="w-full text-left justify-between [&>span]:text-left [&>span]:truncate [&>span]:block">
                    <SelectValue
                      placeholder={
                        isLibActsLoading
                          ? 'Loading activities...'
                          : availableActivities.length === 0
                            ? 'All eligible LIB activities have already been assigned'
                            : 'Select activity'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent align="start" className="text-left">
                    {availableActivities.map((a: any) => (
                      <SelectItem key={a.id} value={a.id} className="text-left justify-start cursor-pointer">
                        <span className="text-left truncate">{a.name || a.id}</span>
                      </SelectItem>
                    ))}
                    {otherAssignedActivities.map((a: any) => (
                      <SelectItem
                        key={a.id}
                        value={a.id}
                        disabled
                        className="text-left justify-start opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50"
                      >
                        <span className="text-left truncate text-slate-500 flex items-center gap-1.5">
                          <Lock className="h-3 w-3 inline shrink-0 text-slate-400" />
                          <span>{a.name || a.id}</span>
                          <span className="text-[10px] text-muted-foreground italic">(Already included in another PPMP)</span>
                        </span>
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
