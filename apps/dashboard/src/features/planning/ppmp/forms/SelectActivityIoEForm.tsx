/**
 * SelectActivityIoEForm
 * Form for selecting a Budget Activity and Item of Expenditure to add to PPMP.
 * Shows available activities, then IoE blocks for the selected activity.
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, ShoppingCart, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BudgetActivity, ItemOfExpenditure, PPMP } from '../types'
import { formatCurrency } from '../lib/ppmpUtils'

const selectActivityIoESchema = z.object({
  activityId: z.string().min(1, 'Please select a Budget Activity.'),
  ioEId: z.string().min(1, 'Please select an Item of Expenditure.'),
  isProcurable: z.boolean(),
})

export type SelectActivityIoEFormValues = z.infer<
  typeof selectActivityIoESchema
>

interface SelectActivityIoEFormProps {
  ppmp: PPMP
  activities: BudgetActivity[]
  ioEsByActivity: Record<string, ItemOfExpenditure[]>
  onSubmit: (data: SelectActivityIoEFormValues) => void
  onCancel: () => void
  onActivityChange: (activityId: string) => void
  isLoading?: boolean
  isMutating?: boolean
  error?: string | null
}

export function SelectActivityIoEForm({
  ppmp,
  activities,
  ioEsByActivity,
  onSubmit,
  onCancel,
  onActivityChange,
  isLoading = false,
  isMutating = false,
  error = null,
}: SelectActivityIoEFormProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('')
  const form = useForm<SelectActivityIoEFormValues>({
    resolver: zodResolver(selectActivityIoESchema),
    defaultValues: {
      activityId: '',
      ioEId: '',
      isProcurable: true,
    },
  })

  const selectedActivity = selectedActivityId
    ? activities.find((a) => a.id === selectedActivityId)
    : null

  const availableIoEs = selectedActivityId
    ? ioEsByActivity[selectedActivityId] || []
    : []

  // Check for duplicate IoE blocks already in PPMP
  const getAlreadyAddedIoEIds = (): Set<string> => {
    const added = new Set<string>()
    for (const activity of ppmp.activityBlocks) {
      for (const ioE of activity.ioEBlocks) {
        added.add(ioE.ioEId)
      }
    }
    return added
  }

  const alreadyAddedIoEIds = getAlreadyAddedIoEIds()
  const availableIoEsFiltered = availableIoEs.filter(
    (ioe) => !alreadyAddedIoEIds.has(ioe.id),
  )

  const handleActivityChange = (activityId: string) => {
    setSelectedActivityId(activityId)
    form.setValue('activityId', activityId)
    form.setValue('ioEId', '') // Reset IoE selection when activity changes
    form.clearErrors('ioEId')
    onActivityChange(activityId) // Notify parent to load IoEs for this activity
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <Spinner className="h-6 w-6" />
        <p className="text-sm text-muted-foreground">Loading activities...</p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <Alert
            variant="outline"
            className="border-destructive/50 bg-destructive/5"
          >
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Budget Activity Selection */}
        <FormField
          control={form.control}
          name="activityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Activity</FormLabel>
              <Select value={field.value} onValueChange={handleActivityChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Budget Activity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activities.length === 0 ? (
                    <div className="px-3 py-1.5 text-sm text-muted-foreground">
                      No activities available
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{activity.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {activity.code}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Item of Expenditure Selection */}
        {selectedActivityId && (
          <FormField
            control={form.control}
            name="ioEId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item of Expenditure</FormLabel>
                <FormDescription className="text-xs">
                  {availableIoEsFiltered.length} of {availableIoEs.length}{' '}
                  available ({alreadyAddedIoEIds.size} already added)
                </FormDescription>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an Item of Expenditure" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableIoEsFiltered.length === 0 ? (
                      <div className="px-3 py-1.5 text-sm text-muted-foreground">
                        {alreadyAddedIoEIds.size > 0
                          ? 'All IoE blocks from this activity are already added'
                          : 'No items of expenditure available'}
                      </div>
                    ) : (
                      availableIoEsFiltered.map((ioe) => (
                        <SelectItem key={ioe.id} value={ioe.id}>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{ioe.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {ioe.code} · Budget Limit:{' '}
                              {formatCurrency(ioe.budgetLimit)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Summary */}
        {selectedActivity && availableIoEsFiltered.length > 0 && (
          <div className="rounded-lg bg-muted/40 px-3 py-3 text-sm space-y-1.5">
            <div>
              <span className="text-muted-foreground">Activity: </span>
              <span className="font-medium">{selectedActivity.name}</span>
            </div>
            {form.getValues('ioEId') && (
              <div>
                <span className="text-muted-foreground">
                  IoE Budget Limit:{' '}
                </span>
                <span className="font-medium">
                  {formatCurrency(
                    availableIoEsFiltered.find(
                      (i) => i.id === form.getValues('ioEId'),
                    )?.budgetLimit || 0,
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Is Procurable — shown once an IoE is selected */}
        {form.watch('ioEId') && (
          <FormField
            control={form.control}
            name="isProcurable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Procurement Type</FormLabel>
                <FormDescription className="text-xs">
                  Determines whether catalog items can be added to this IoE
                  block.
                </FormDescription>
                <FormControl>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => field.onChange(true)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg border px-3 py-3 text-sm transition-all',
                        field.value
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border bg-background text-muted-foreground hover:border-foreground/40',
                      )}
                    >
                      <ShoppingCart className="h-4 w-4 shrink-0" />
                      <div className="text-left">
                        <div className="font-medium leading-tight">
                          Procurable
                        </div>
                        <div className="text-xs opacity-70 leading-tight mt-0.5">
                          Items can be added
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange(false)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg border px-3 py-3 text-sm transition-all',
                        !field.value
                          ? 'border-destructive bg-destructive/10 text-destructive font-medium'
                          : 'border-border bg-background text-muted-foreground hover:border-foreground/40',
                      )}
                    >
                      <Ban className="h-4 w-4 shrink-0" />
                      <div className="text-left">
                        <div className="font-medium leading-tight">
                          Non-Procurable
                        </div>
                        <div className="text-xs opacity-70 leading-tight mt-0.5">
                          No items allowed
                        </div>
                      </div>
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={isMutating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isMutating || availableIoEsFiltered.length === 0}
          >
            {isMutating ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Adding...
              </>
            ) : (
              'Add Activity'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
