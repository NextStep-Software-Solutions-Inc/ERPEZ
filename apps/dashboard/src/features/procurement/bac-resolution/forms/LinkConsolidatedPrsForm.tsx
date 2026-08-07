import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LinkConsolidatedPrsPayload } from '../types'
import type { LinkableConsolidatedPr } from '../utils/bacResolutionWorkflow'
import FieldInfo from '@/components/FieldInfo'

const linkConsolidatedPrSchema = z.object({
  consolidatedPRId: z
    .string()
    .min(1, 'Select exactly one Consolidated PR for this BAC Resolution.'),
})

export type LinkConsolidatedPrsFormValues = z.infer<
  typeof linkConsolidatedPrSchema
>

interface LinkConsolidatedPrsFormProps {
  availablePrs: LinkableConsolidatedPr[]
  initialSelectedId?: string | null
  onSubmit: (values: LinkConsolidatedPrsPayload) => Promise<void> | void
  onCancel: () => void
  bacResolutionId: string
  isLoading?: boolean
  onDirtyChange?: (isDirty: boolean) => void
  onViewDetails?: (id: string) => void
  formId?: string
}

export function LinkConsolidatedPrsForm({
  availablePrs,
  initialSelectedId = null,
  onSubmit,
  bacResolutionId,
  onDirtyChange,
  onViewDetails,
  formId,
}: LinkConsolidatedPrsFormProps) {
  const form = useForm({
    defaultValues: {
      consolidatedPRId: initialSelectedId ?? '',
    },
    validators: {
      onChange: linkConsolidatedPrSchema,
      onSubmit: linkConsolidatedPrSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        bacResolutionId,
        consolidatedPRId: value.consolidatedPRId,
      })
      onDirtyChange?.(false)
    },
  })

  useEffect(() => {
    onDirtyChange?.(form.state.isDirty)
  }, [form.state.isDirty, onDirtyChange])

  return (
    <>
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-5"
      >
        <form.Field name="consolidatedPRId">
          {(field) => {
            const selectedId = field.state.value

            return (
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label>Select exactly one approved Consolidated PR</Label>
                  <p className="text-xs text-muted-foreground">
                    A Consolidated PR can only belong to one BAC Resolution.
                  </p>
                </div>
                <ScrollArea className="max-h-[320px] rounded-lg border border-default-200">
                  <div className="space-y-2 p-3">
                    {availablePrs.map((pr) => {
                      const isChecked = selectedId === pr.id
                      const isDisabled = pr.isOwnedByAnotherResolution
                      const ownerLabel = pr.owner?.bacResolutionNumber

                      return (
                        <label
                          key={pr.id}
                          className={`flex items-start gap-3 rounded-lg border p-3 ${
                            isDisabled
                              ? 'cursor-not-allowed border-warning/40 bg-warning/5'
                              : 'cursor-pointer border-default-200 bg-background hover:bg-default-50'
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            disabled={isDisabled}
                            onCheckedChange={() => {
                              if (isDisabled) {
                                return
                              }
                              // Toggle selection: check if unchecked, uncheck if clicked again
                              const nextVal = isChecked ? '' : pr.id
                              field.handleChange(nextVal)
                            }}
                            className="mt-1 rounded-full" // Rounded-full styling gives it a Radio / Single select look
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-medium">{pr.prNumber}</p>
                              <div className="flex items-center gap-3">
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                  {isDisabled ? (
                                    <Badge variant="outline" color="warning">
                                      Owned by {ownerLabel}
                                    </Badge>
                                  ) : isChecked ? (
                                    <Badge variant="outline" color="success">
                                      Selected
                                    </Badge>
                                  ) : null}
                                  <p className="text-sm font-medium">
                                    ₱{(pr.amount ?? 0).toLocaleString('en-PH')}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="xs"
                                  onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    onViewDetails?.(pr.id)
                                  }}
                                  className="h-7 text-xs px-2"
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {pr.projectName} · {pr.endUser}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {pr.modeOfProcurement} · {pr.description}
                            </p>
                            {isDisabled && ownerLabel ? (
                              <p className="text-xs text-warning">
                                This Consolidated PR is already linked to{' '}
                                {ownerLabel}.
                              </p>
                            ) : null}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </ScrollArea>
                <FieldInfo field={field} />
              </div>
            )
          }}
        </form.Field>
      </form>
    </>
  )
}
