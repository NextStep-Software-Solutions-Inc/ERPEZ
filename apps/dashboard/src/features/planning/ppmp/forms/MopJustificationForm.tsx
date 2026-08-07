/**
 * MopJustificationForm
 * Inline form for overriding the system-suggested Mode of Procurement.
 * Shown inside the MopOverrideDialog.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import type { ModeOfProcurement } from '../types'

const MOP_OPTIONS: ModeOfProcurement[] = [
  'NP-53.5',
  'NP-53.9',
  'Public Bidding',
  'NP-53.1',
  'Shopping',
  'By Administration',
]

const mopJustificationSchema = z.object({
  mopOverride: z.enum([
    'NP-53.5',
    'NP-53.9',
    'Public Bidding',
    'NP-53.1',
    'Shopping',
    'By Administration',
  ]),
  mopJustification: z
    .string()
    .min(10, 'Justification must be at least 10 characters.')
    .max(500, 'Justification must not exceed 500 characters.'),
})

export type MopJustificationFormValues = z.infer<typeof mopJustificationSchema>

interface MopJustificationFormProps {
  suggestedMoP: ModeOfProcurement
  currentOverride: ModeOfProcurement | null
  currentJustification: string
  onSubmit: (data: MopJustificationFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export function MopJustificationForm({
  suggestedMoP,
  currentOverride,
  currentJustification,
  onSubmit,
  onCancel,
  isLoading = false,
}: MopJustificationFormProps) {
  const form = useForm<MopJustificationFormValues>({
    resolver: zodResolver(mopJustificationSchema),
    defaultValues: {
      mopOverride: currentOverride ?? suggestedMoP,
      mopJustification: currentJustification,
    },
  })

  const justificationValue = form.watch('mopJustification')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-md bg-muted/50 px-4 py-3 text-sm">
          <span className="text-muted-foreground">System-suggested MoP: </span>
          <span className="font-semibold text-foreground">{suggestedMoP}</span>
        </div>

        <FormField
          control={form.control}
          name="mopOverride"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Override Mode of Procurement</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select MoP" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MOP_OPTIONS.map((mop) => (
                    <SelectItem key={mop} value={mop}>
                      {mop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mopJustification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brief Justification <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Explain why this alternative mode of procurement is more appropriate (e.g., urgency, specific technical requirements)..."
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-right text-xs">
                {justificationValue.length} / 500
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save MoP Override'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
